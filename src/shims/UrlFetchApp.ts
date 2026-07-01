import { execFileSync } from 'child_process';

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
  body: string;
  status: number;
  headers: Record<string, string>;
}

function isRawResponse(x: unknown): x is RawResponse {
  if (typeof x !== 'object' || x === null) return false;
  if (!('body' in x) || typeof x.body !== 'string') return false;
  if (!('status' in x) || typeof x.status !== 'number') return false;
  if (!('headers' in x) || typeof x.headers !== 'object' || x.headers === null) return false;
  return true;
}

export class HTTPResponse {
  private body: string;
  private status: number;
  private headers: Record<string, string>;

  constructor(raw: RawResponse) {
    this.body = raw.body;
    this.status = raw.status;
    this.headers = raw.headers;
  }

  getContentText(): string { return this.body; }
  getResponseCode(): number { return this.status; }
  getHeaders(): Record<string, string> { return this.headers; }
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
  const responseBody = await res.text();
  const responseHeaders = {};
  res.headers.forEach((v, k) => { responseHeaders[k] = v; });
  if (!muteHttpExceptions && res.status >= 400) {
    throw new Error('Request to ' + url + ' failed with status ' + res.status + ': ' + responseBody);
  }
  return { body: responseBody, status: res.status, headers: responseHeaders };
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
};
