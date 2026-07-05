import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

function stubResponse(body: string, status: number, headers: Record<string, string> = {}) {
  mockExecFileSync.mockReturnValue(JSON.stringify([{ bodyBase64: Buffer.from(body, 'utf-8').toString('base64'), status, headers }]));
}

function stubResponses(responses: Array<{ body: string; status: number; headers?: Record<string, string> }>) {
  mockExecFileSync.mockReturnValue(
    JSON.stringify(
      responses.map(({ body, ...rest }) => ({
        headers: {},
        ...rest,
        bodyBase64: Buffer.from(body, 'utf-8').toString('base64'),
      }))
    )
  );
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

  it('getAllHeaders() returns the same header map as getHeaders()', async () => {
    stubResponse('hello', 200, { 'content-type': 'text/plain', 'x-custom': 'abc' });
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    expect(res.getAllHeaders()).toEqual({ 'content-type': 'text/plain', 'x-custom': 'abc' });
  });

  it('getRequest() describes the request without sending it, defaulting contentType for a form-object payload', async () => {
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const request = UrlFetchApp.getRequest('https://example.com', { method: 'post', payload: { key: 'value' } });

    expect(request).toEqual({
      url: 'https://example.com',
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      payload: { key: 'value' },
      headers: {},
    });
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('getContent() returns the raw bytes of the response body', async () => {
    stubResponse('hello', 200);
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    expect(res.getContent()).toEqual(Array.from(Buffer.from('hello', 'utf-8')));
  });

  it('getContentText(charset) decodes the response body with the given charset', async () => {
    stubResponse('café', 200);
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    expect(res.getContentText('utf-8')).toBe('café');
  });

  it('getBlob() wraps the response body in a Blob, using the response Content-Type header', async () => {
    stubResponse('hello', 200, { 'Content-Type': 'text/plain' });
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    const blob = res.getBlob();
    expect(blob.getDataAsString()).toBe('hello');
    expect(blob.getContentType()).toBe('text/plain');
  });

  it('getAs(contentType) wraps the response body in a Blob with the requested content type', async () => {
    stubResponse('hello', 200, { 'Content-Type': 'text/plain' });
    const { UrlFetchApp } = await import('../shims/UrlFetchApp.js');

    const res = UrlFetchApp.fetch('https://example.com');
    const blob = res.getAs('application/octet-stream');
    expect(blob.getContentType()).toBe('application/octet-stream');
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
