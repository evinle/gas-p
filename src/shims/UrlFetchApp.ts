import { execFileSync } from 'child_process';
import { isBufferEncoding } from './bufferEncoding.js';
import { Blob } from './Blob.js';

export interface UrlFetchParams {
  method?: string;
  headers?: Record<string, string>;
  payload?: string | Record<string, string>;
  muteHttpExceptions?: boolean;
  contentType?: string;
}

interface FetchRequest {
  url: string;
  params?: UrlFetchParams;
}

interface RawResponse {
  bodyBase64: string;
  status: number;
  headers: Record<string, string>;
}

function isRawResponse(x: unknown): x is RawResponse {
  if (typeof x !== 'object' || x === null) return false;
  if (!('bodyBase64' in x) || typeof x.bodyBase64 !== 'string') return false;
  if (!('status' in x) || typeof x.status !== 'number') return false;
  if (!('headers' in x) || typeof x.headers !== 'object' || x.headers === null) return false;
  return true;
}

export class HTTPResponse {
  private bytes: number[];
  private status: number;
  private headers: Record<string, string>;

  constructor(raw: RawResponse) {
    this.bytes = Array.from(Buffer.from(raw.bodyBase64, 'base64'));
    this.status = raw.status;
    this.headers = raw.headers;
  }

  // "Gets the content of an HTTP response encoded as a string." — HTTPResponse
  // docs, with no stated default charset; UTF-8 matches Blob's own documented
  // default and is the overwhelmingly common real-world case.
  getContentText(charset = 'utf-8'): string {
    if (!isBufferEncoding(charset)) throw new Error(`Unsupported charset: ${charset}`);
    return Buffer.from(this.bytes).toString(charset);
  }

  // "Gets the raw binary content of an HTTP response." — HTTPResponse docs.
  getContent(): number[] {
    return this.bytes;
  }

  getResponseCode(): number { return this.status; }
  getHeaders(): Record<string, string> { return this.headers; }

  // "Return the data inside this object as a blob." — HTTPResponse docs. No
  // documented default content type; falling back to the response's own
  // Content-Type header (or a generic default if absent) matches how the
  // bytes were actually served.
  getBlob(): Blob {
    return new Blob([...this.bytes], { contentType: this.headers['Content-Type'] ?? 'application/octet-stream' });
  }

  // "Return the data inside this object as a blob converted to the specified
  // content type." — HTTPResponse docs. Real format conversion (e.g. HTML ->
  // PDF) isn't implementable locally, so this tags the same bytes with the
  // requested content type rather than converting them.
  getAs(contentType: string): Blob {
    return new Blob([...this.bytes], { contentType });
  }

  // "Returns an attribute/value map of headers ... with headers that have
  // multiple values returned as arrays." — HTTPResponse docs. The subprocess
  // capture is built from the Fetch API's Headers, which already folds
  // repeated header names into one comma-joined string per the Fetch spec,
  // so there's no multi-value array to reconstruct here.
  getAllHeaders(): Record<string, string> { return this.headers; }
}

// Mirrors the contentType-defaulting branch inside buildFetchScript's
// subprocess script below — duplicated rather than shared because that logic
// runs as a generated string in a separate spawned process, not this one.
function resolveContentType(payload: UrlFetchParams['payload'], contentType?: string): string | undefined {
  if (payload === undefined || typeof payload === 'string') return contentType;
  return contentType ?? 'application/x-www-form-urlencoded';
}

function buildFetchScript(requests: FetchRequest[]): string {
  return `
const requests = ${JSON.stringify(requests)};
const results = await Promise.all(requests.map(async ({ url, params = {} }) => {
  const { method = 'get', headers = {}, payload, muteHttpExceptions = false, contentType } = params;
  const fetchHeaders = { ...headers };
  let body;
  if (payload !== undefined) {
    if (typeof payload === 'string') {
      body = payload;
      if (contentType) fetchHeaders['Content-Type'] = contentType;
    } else {
      body = Object.entries(payload).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
      fetchHeaders['Content-Type'] = contentType ?? 'application/x-www-form-urlencoded';
    }
  }
  const res = await fetch(url, { method: method.toUpperCase(), headers: fetchHeaders, body });
  const responseBytes = Buffer.from(await res.arrayBuffer());
  const bodyBase64 = responseBytes.toString('base64');
  const responseHeaders = {};
  res.headers.forEach((v, k) => { responseHeaders[k] = v; });
  if (!muteHttpExceptions && res.status >= 400) {
    throw new Error('Request to ' + url + ' failed with status ' + res.status + ': ' + responseBytes.toString('utf-8'));
  }
  return { bodyBase64, status: res.status, headers: responseHeaders };
}));
process.stdout.write(JSON.stringify(results));
`;
}

function execFetch(requests: FetchRequest[]): RawResponse[] {
  const output = execFileSync(process.execPath, ['--input-type=module'], {
    input: buildFetchScript(requests),
    encoding: 'utf-8',
  });
  const parsed: unknown = JSON.parse(output);
  if (!Array.isArray(parsed) || !parsed.every(isRawResponse)) {
    throw new Error('Unexpected response shape from fetch subprocess');
  }
  return parsed;
}

export const UrlFetchApp = {
  fetch(url: string, params?: UrlFetchParams): HTTPResponse {
    const [raw] = execFetch([{ url, params }]);
    return new HTTPResponse(raw);
  },

  fetchAll(requests: Array<string | FetchRequest>): HTTPResponse[] {
    const normalised: FetchRequest[] = requests.map((r) =>
      typeof r === 'string' ? { url: r } : r
    );
    return execFetch(normalised).map((raw) => new HTTPResponse(raw));
  },

  // "Returns the request that is made if the operation was invoked. This
  // method does not actually issue the request." — UrlFetchApp docs.
  getRequest(url: string, params: UrlFetchParams = {}): Record<string, unknown> {
    const { method = 'get', headers = {}, payload, contentType } = params;
    return {
      url,
      method,
      contentType: resolveContentType(payload, contentType),
      payload,
      headers,
    };
  },
};
