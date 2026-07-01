import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

function stubResponse(body: string, status: number, headers: Record<string, string> = {}) {
  mockExecFileSync.mockReturnValue(JSON.stringify([{ body, status, headers }]));
}

function stubResponses(responses: Array<{ body: string; status: number; headers?: Record<string, string> }>) {
  mockExecFileSync.mockReturnValue(JSON.stringify(responses.map((r) => ({ headers: {}, ...r }))));
}

beforeEach(() => { vi.resetAllMocks(); });

describe('UrlFetchApp.fetchAll()', () => {
  it('returns an HTTPResponse for each request', async () => {
    stubResponses([
      { body: 'first', status: 200 },
      { body: 'second', status: 201 },
    ]);
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const results = UrlFetchApp.fetchAll(['https://a.com', 'https://b.com']);
    expect(results).toHaveLength(2);
    expect(results[0].getContentText()).toBe('first');
    expect(results[1].getResponseCode()).toBe(201);
  });
});

describe('UrlFetchApp.fetch()', () => {
  it('returns an HTTPResponse with the correct body, status, and headers', async () => {
    stubResponse('hello', 200, { 'content-type': 'text/plain' });
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    expect(res.getContentText()).toBe('hello');
    expect(res.getResponseCode()).toBe(200);
    expect(res.getHeaders()).toEqual({ 'content-type': 'text/plain' });
  });

  it('throws on 4xx when muteHttpExceptions is not set', async () => {
    mockExecFileSync.mockImplementation(() => { throw new Error('Request to https://example.com failed with status 404: Not Found'); });
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    expect(() => UrlFetchApp.fetch('https://example.com')).toThrow('404');
  });

  it('returns an HTTPResponse on 4xx when muteHttpExceptions is true', async () => {
    stubResponse('Not Found', 404);
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com', { muteHttpExceptions: true });
    expect(res.getResponseCode()).toBe(404);
    expect(res.getContentText()).toBe('Not Found');
  });
});
