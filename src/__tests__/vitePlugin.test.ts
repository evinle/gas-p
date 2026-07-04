import { describe, it, expect, vi } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { gasPVitePlugin } from '../adapters/vitePlugin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'dispatch');

function fakeRequest(method: string, body: unknown, url = '/') {
  return {
    method,
    url,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body));
    },
  };
}

function fakeServer(use: ReturnType<typeof vi.fn>, config: Record<string, unknown> = {}) {
  return {
    middlewares: { use },
    transformIndexHtml: vi.fn(async (_url: string, html: string) => html + '<!--hmr-client-->'),
    config: { resolve: {}, plugins: [], root: __dirname, ...config },
  };
}

function fakeResponse() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: '',
    writeHead(status: number, headers: Record<string, string>) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(chunk: string) {
      this.body = chunk;
    },
  };
}

describe('gasPVitePlugin', () => {
  it('responds to a POST on the configured endpoint with the RPC result', async () => {
    const plugin = gasPVitePlugin({ srcDir: join(FIXTURES, 'basic'), endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    plugin.configureServer(fakeServer(use));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [path, handler] = rpcCall!;
    expect(path).toBe('/__gasp/rpc');

    const req = fakeRequest('POST', { fnName: 'add', args: [2, 3] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 5 });
  });

  it('bundles a multi-file .ts entry before dispatching, when configured with entry', async () => {
    const tsFixture = join(__dirname, '__fixtures__', 'dispatch-ts', 'basic');
    const plugin = gasPVitePlugin({ srcDir: tsFixture, entry: 'Code.ts', endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    plugin.configureServer(fakeServer(use));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', { fnName: 'add', args: [2, 3] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 5 });
  });

  it('does not reuse the dev server\'s own internal serve-only plugins when bundling .ts source', async () => {
    // server.config.plugins is Vite's *fully resolved* plugin list, which
    // includes its own internal serve-only plugins (vite:import-analysis,
    // the alias plugin it wires up, etc). Those close over a live dev-server
    // moduleGraph/environment and throw if reused inside the nested build()
    // call context.ts runs to bundle .ts source — so they must be filtered
    // out rather than passed through untouched.
    const throwingCorePlugin = {
      name: 'vite:import-analysis',
      transform() {
        throw new Error('vite:import-analysis should not run outside its own dev server');
      },
    };
    const throwingAliasPlugin = {
      name: 'alias',
      resolveId() {
        throw new Error('the dev server\'s own alias plugin should not run outside its own dev server');
      },
    };

    const tsFixture = join(__dirname, '__fixtures__', 'dispatch-ts', 'basic');
    const plugin = gasPVitePlugin({ srcDir: tsFixture, entry: 'Code.ts', endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    const server = fakeServer(use, { plugins: [throwingCorePlugin, throwingAliasPlugin] });
    plugin.configureServer(server);

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', { fnName: 'add', args: [2, 3] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 5 });
  });

  it("resolves an import against a path alias from the consumer's own resolved Vite config", async () => {
    const aliasFixture = join(__dirname, '__fixtures__', 'context', 'consumer-config-alias');
    const plugin = gasPVitePlugin({ srcDir: aliasFixture, entry: 'Code.ts', endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    const server = fakeServer(use, {
      resolve: { alias: { '@utils': join(aliasFixture, 'Utils.ts') } },
    });
    plugin.configureServer(server);

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', { fnName: 'getGreeting', args: ['World'] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 'Hello, World' });
  });

  it('loads srcDir from gas-p.config.ts when no srcDir is passed in plugin options', async () => {
    const projectRoot = join(__dirname, '__fixtures__', 'vite-plugin-config');
    const plugin = gasPVitePlugin({ endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    await plugin.configureServer(fakeServer(use, { root: projectRoot }));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', { fnName: 'add', args: [2, 3] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 5 });
  });

  it('serves doGet HTML for a GET / request, run through transformIndexHtml', async () => {
    const harnessFixture = join(__dirname, '__fixtures__', 'harness', 'plain-html');
    const plugin = gasPVitePlugin({ srcDir: harnessFixture, endpoint: '/__gasp/rpc' });
    const use = vi.fn();
    const server = fakeServer(use);
    plugin.configureServer(server);

    const pageHandlerCall = use.mock.calls.find((call) => call.length === 1);
    expect(pageHandlerCall).toBeDefined();
    const [pageHandler] = pageHandlerCall!;

    const req = fakeRequest('GET', undefined, '/');
    const res = fakeResponse();
    const next = vi.fn();
    await pageHandler(req, res, next);

    expect(server.transformIndexHtml).toHaveBeenCalledWith(
      '/',
      ['<html>', '  <body>', '    <h1>Hello gas-p</h1>', '  </body>', '</html>', ''].join('\n')
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<!--hmr-client-->');
  });

  it('rejects a non-allowlisted calendar ID before any live API call, surfacing a {message}-only error over the RPC path', async () => {
    const calendarFixture = join(FIXTURES, 'calendar');
    const plugin = gasPVitePlugin({
      srcDir: calendarFixture,
      endpoint: '/__gasp/rpc',
      credentialsPath: '/fake/credentials.json',
      devResourceIds: { CalendarApp: ['cal123'] },
    });
    const use = vi.fn();
    plugin.configureServer(fakeServer(use));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', { fnName: 'getMyEvents', args: [] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(false);
    expect(body.error).toEqual({ message: expect.stringContaining('primary') });
    expect(body.error.message).toContain('CalendarApp');
  });
});
