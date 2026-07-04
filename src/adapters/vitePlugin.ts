import { join } from 'node:path';
import type { ConsumerViteConfig } from '../core/context.js';
import { handleRpcCall } from '../core/dispatch.js';
import { resolveSource } from '../core/harness.js';
import { loadGasPConfig } from '../core/config.js';

interface RpcRequest {
  method?: string;
  url?: string;
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer | string>;
}

interface RpcResponse {
  writeHead(status: number, headers: Record<string, string>): void;
  end(chunk: string): void;
}

type MiddlewareHandler = (req: RpcRequest, res: RpcResponse, next: () => void) => void | Promise<void>;

interface ConnectMiddlewareStack {
  use(path: string, handler: MiddlewareHandler): void;
  use(handler: MiddlewareHandler): void;
}

interface ViteDevServerLike {
  middlewares: ConnectMiddlewareStack;
  transformIndexHtml(url: string, html: string): Promise<string>;
  config: {
    root: string;
    resolve?: ConsumerViteConfig['resolve'];
    plugins?: readonly { name?: string }[];
  };
}

export interface GasPPluginOptions {
  srcDir?: string;
  entry?: string;
  endpoint?: string;
  page?: string;
  configFile?: string;
}

function isRpcRequestBody(x: unknown): x is { fnName: string; args: unknown[] } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('fnName' in x) || typeof x.fnName !== 'string') return false;
  if (!('args' in x) || !Array.isArray(x.args)) return false;
  return true;
}

async function readBody(req: RpcRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Always responds 200 — google.script.run has no HTTP status-code equivalent
// since it's postMessage-based, not HTTP. The response body carries the
// outcome via dispatch.ts's {ok, value} / {ok: false, error} contract.
export function gasPVitePlugin(options: GasPPluginOptions) {
  const endpoint = options.endpoint ?? '/__gasp/rpc';
  const page = options.page ?? '/';

  return {
    name: 'gas-p',
    async configureServer(server: ViteDevServerLike) {
      // Resolved once here, at server start — not per request. Explicit
      // plugin options win; gas-p.config.ts is only consulted when srcDir
      // isn't passed explicitly (port isn't read by this adapter — Vite's
      // own server.port already owns that).
      const fileConfig = options.srcDir
        ? undefined
        : await loadGasPConfig(options.configFile ?? join(server.config.root, 'gas-p.config.ts'));
      const srcDir = options.srcDir ?? fileConfig!.srcDir;
      const entry = options.entry ?? fileConfig?.entry;

      // Reuse the consumer's own resolved resolve/plugins config so the
      // dev-time bundle resolves aliases/imports identically to their real
      // `vite build` output. Exclude this plugin itself from the passed-in
      // list — feeding it back into the nested build() call would register
      // it against that inner build for no benefit and unclear side effects.
      const consumerConfig: ConsumerViteConfig = {
        resolve: server.config.resolve,
        plugins: (server.config.plugins ?? []).filter((p) => p.name !== 'gas-p') as ConsumerViteConfig['plugins'],
      };
      const source = resolveSource(srcDir, entry, consumerConfig);

      // No path filter and no returned callback: this runs on every request,
      // ahead of Vite's own HTML middleware, so a raw <?= ?> scriptlet
      // template is never handed to Vite's HTML parser as a plain entry file.
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || req.url !== page) {
          next();
          return;
        }

        const html = await source.renderDoGet();
        const transformed = await server.transformIndexHtml(req.url, html);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(transformed);
      });

      server.middlewares.use(endpoint, async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        const raw = await readBody(req);
        const parsed: unknown = JSON.parse(raw);
        if (!isRpcRequestBody(parsed)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: { message: 'Malformed RPC request body' } }));
          return;
        }

        // Fresh context per request, matching Apps Script's per-execution
        // model: no module-level state persists across calls.
        const context = await source.buildContext();
        const result = handleRpcCall(context, parsed.fnName, parsed.args);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    },
  };
}
