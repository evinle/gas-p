import { describe, it, expect, vi } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { gasPVitePlugin } from '../adapters/vitePlugin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'dispatch');

function fakeRequest(method: string, body: unknown) {
  return {
    method,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body));
    },
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
    plugin.configureServer({ middlewares: { use } });

    const [path, handler] = use.mock.calls[0];
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
    plugin.configureServer({ middlewares: { use } });

    const [, handler] = use.mock.calls[0];
    const req = fakeRequest('POST', { fnName: 'add', args: [2, 3] });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true, value: 5 });
  });
});
