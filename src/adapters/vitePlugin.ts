import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { ConsumerViteConfig, ServiceOptions } from '../core/context.js';
import { handleRpcCall } from '../core/dispatch.js';
import { resolveSource } from '../core/harness.js';
import { loadGasPConfig } from '../core/config.js';
import { DEFAULT_CREDENTIALS_PATH, DEFAULT_CLIENT_SECRET_PATH } from '../auth.js';

interface RpcRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
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
  fixturesFile?: string;
  htmlDir?: string;
  credentialsPath?: string;
  clientSecretPath?: string;
  devResourceIds?: Record<string, string[]>;
}

function isRpcRequestBody(x: unknown): x is { fnName: string; args: unknown[] } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('fnName' in x) || typeof x.fnName !== 'string') return false;
  if (!('args' in x) || !Array.isArray(x.args)) return false;
  return true;
}

function extractUserAgent(req: RpcRequest): string | undefined {
  const userAgent = req.headers?.['user-agent'];
  return typeof userAgent === 'string' ? userAgent : undefined;
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
export function gasPVitePlugin(options: GasPPluginOptions): Plugin {
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
      const services: ServiceOptions = {
        credentialsPath: options.credentialsPath ?? DEFAULT_CREDENTIALS_PATH,
        clientSecretPath: options.clientSecretPath ?? DEFAULT_CLIENT_SECRET_PATH,
        devResourceIds: options.devResourceIds ?? fileConfig?.devResourceIds,
      };

      // Reuse the consumer's own resolved resolve/plugins config so the
      // dev-time bundle resolves aliases/imports identically to their real
      // `vite build` output. server.config.plugins is the dev server's
      // *fully resolved* plugin list, which also includes Vite's own
      // internal serve-only plugins (vite:import-analysis, vite:resolve,
      // the @rollup/plugin-alias instance it wires up, ...) — those close
      // over a live dev-server moduleGraph/environment and crash
      // (`environment.moduleGraph` is undefined) when reused inside our
      // separate nested build() call below, which has no dev server behind
      // it. The nested build() sets up its own equivalent core plugins from
      // `resolve` already, so only genuinely consumer-added plugins (not
      // named with Vite's own "vite:"/"alias"/this-plugin's-own prefixes)
      // need to be threaded through here.
      const isConsumerPlugin = (p: { name?: string }) =>
        p.name !== undefined && p.name !== 'gas-p' && p.name !== 'alias' && !p.name.startsWith('vite:');
      const consumerConfig: ConsumerViteConfig = {
        resolve: server.config.resolve,
        plugins: (server.config.plugins ?? []).filter(isConsumerPlugin) as ConsumerViteConfig['plugins'],
      };
      // Resolved once here, at server start, same as configFile above — but
      // unlike configFile, this path is only ever *read* per request (never
      // cached): buildContext/buildBundledContext call loadFixtures(fresh)
      // on every invocation (see ADR 0009), so the file's contents can
      // change between requests with no dev-server restart required.
      const fixturesFile = options.fixturesFile ?? join(server.config.root, 'gas-p.fixtures.ts');
      const source = resolveSource({ srcDir, entry, consumerConfig, services, htmlDir: options.htmlDir, fixturesFile });

      // No path filter and no returned callback: this runs on every request,
      // ahead of Vite's own HTML middleware, so a raw <?= ?> scriptlet
      // template is never handed to Vite's HTML parser as a plain entry file.
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || req.url !== page) {
          next();
          return;
        }

        const { html, xFrameOptionsMode } = await source.renderDoGet(extractUserAgent(req));
        const transformed = await server.transformIndexHtml(req.url, html);

        // Verified against real Apps Script deployments (see ADR 0008):
        // ALLOWALL serves with no X-Frame-Options header at all; every other
        // mode (DEFAULT, or none set) serves with SAMEORIGIN.
        const headers: Record<string, string> = { 'Content-Type': 'text/html' };
        if (xFrameOptionsMode !== 'ALLOWALL') {
          headers['X-Frame-Options'] = 'SAMEORIGIN';
        }

        res.writeHead(200, headers);
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
        const context = await source.buildContext(extractUserAgent(req));
        const result = handleRpcCall(context, parsed.fnName, parsed.args);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    },
  };
}
