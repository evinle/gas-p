import { describe, it, expect, vi } from 'vitest';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { gasPVitePlugin } from '../adapters/vitePlugin.js';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

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

function fakeServer(use: ReturnType<typeof vi.fn>) {
  return {
    middlewares: { use },
    transformIndexHtml: vi.fn(async (_url: string, html: string) => html + '<!--hmr-client-->'),
    config: { resolve: {}, plugins: [], root: __dirname },
    watcher: { add: vi.fn(), on: vi.fn() },
    hot: { send: vi.fn() },
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

describe('gasPVitePlugin — Calendar', () => {
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
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('rejects createEvent for a non-allowlisted calendar ID before any live API call, over the RPC path', async () => {
    const calendarWriteFixture = join(FIXTURES, 'calendar-write');
    const plugin = gasPVitePlugin({
      srcDir: calendarWriteFixture,
      endpoint: '/__gasp/rpc',
      credentialsPath: '/fake/credentials.json',
      devResourceIds: { CalendarApp: ['cal123'] },
    });
    const use = vi.fn();
    plugin.configureServer(fakeServer(use));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', {
      fnName: 'createEventFor',
      args: ['not-allowlisted', 'New Meeting', '2026-07-01T14:00:00Z', '2026-07-01T15:00:00Z'],
    });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(false);
    expect(body.error.message).toContain('not-allowlisted');
    expect(body.error.message).toContain('CalendarApp');
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('creates an event for an allowlisted calendar ID and flows the created event data back over the RPC path', async () => {
    mockExecFileSync.mockReturnValue(
      JSON.stringify({
        id: 'evt2',
        summary: 'New Meeting',
        start: { dateTime: '2026-07-01T14:00:00Z' },
        end: { dateTime: '2026-07-01T15:00:00Z' },
      })
    );

    const calendarWriteFixture = join(FIXTURES, 'calendar-write');
    const plugin = gasPVitePlugin({
      srcDir: calendarWriteFixture,
      endpoint: '/__gasp/rpc',
      credentialsPath: '/fake/credentials.json',
      devResourceIds: { CalendarApp: ['cal123'] },
    });
    const use = vi.fn();
    plugin.configureServer(fakeServer(use));

    const rpcCall = use.mock.calls.find((call) => call.length === 2);
    const [, handler] = rpcCall!;
    const req = fakeRequest('POST', {
      fnName: 'createEventFor',
      args: ['cal123', 'New Meeting', '2026-07-01T14:00:00Z', '2026-07-01T15:00:00Z'],
    });
    const res = fakeResponse();
    const next = vi.fn();
    await handler(req, res, next);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(body.value.title).toBe('New Meeting');
    expect(body.value.start).toEqual({ __gasp_date__: '2026-07-01T14:00:00.000Z' });
    expect(body.value.end).toEqual({ __gasp_date__: '2026-07-01T15:00:00.000Z' });
  });
});
