import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { createServer } from 'http';
import { dirname } from 'path';
import { google } from 'googleapis';
import open from 'open';

export interface ClientSecret {
  clientId: string;
  clientSecret: string;
}

interface GoogleCredentialsFile {
  installed: {
    client_id: string;
    client_secret: string;
  };
}

function hasClientFields(x: object): x is { client_id: string; client_secret: string } {
  return (
    'client_id' in x && typeof x.client_id === 'string' &&
    'client_secret' in x && typeof x.client_secret === 'string'
  );
}

function isGoogleCredentialsFile(x: unknown): x is GoogleCredentialsFile {
  if (typeof x !== 'object' || x === null) return false;
  if (!('installed' in x)) return false;
  const { installed } = x;
  if (typeof installed !== 'object' || installed === null) return false;
  return hasClientFields(installed);
}

function parseJsonFile(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`${filePath} contains invalid JSON`);
  }
}

export function readClientSecret(secretPath: string): ClientSecret {
  const raw = parseJsonFile(secretPath);
  if (!isGoogleCredentialsFile(raw)) {
    throw new Error(`client_secret.json at ${secretPath} is missing required fields (client_id, client_secret)`);
  }
  return { clientId: raw.installed.client_id, clientSecret: raw.installed.client_secret };
}

interface Manifest {
  oauthScopes: string[];
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((item) => typeof item === 'string');
}

function isManifest(x: unknown): x is Manifest {
  if (typeof x !== 'object' || x === null) return false;
  if (!('oauthScopes' in x)) return false;
  return isStringArray(x.oauthScopes);
}

export interface Credentials {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

function isCredentials(x: unknown): x is Credentials {
  if (typeof x !== 'object' || x === null) return false;
  return (
    'access_token' in x && typeof x.access_token === 'string' &&
    'refresh_token' in x && typeof x.refresh_token === 'string' &&
    'expiry_date' in x && typeof x.expiry_date === 'number'
  );
}

export function readStoredCredentials(credentialsPath: string): Credentials | null {
  if (!existsSync(credentialsPath)) return null;
  const raw: unknown = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
  if (!isCredentials(raw)) throw new Error(`credentials.json at ${credentialsPath} is malformed`);
  return raw;
}

export function buildOAuth2Client(client: ClientSecret, credentials: Credentials) {
  const oauth2Client = new google.auth.OAuth2(client.clientId, client.clientSecret, 'http://localhost');
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
}

export function saveCredentials(credentials: Credentials, credentialsPath: string): void {
  mkdirSync(dirname(credentialsPath), { recursive: true });
  writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
}

export interface CallbackServer {
  port: number;
  awaitCode: () => Promise<string>;
  close: () => void;
}

const DEFAULT_AUTH_TIMEOUT_MS = 3 * 60 * 1000;

export function startCallbackServer(options?: { timeoutMs?: number }): Promise<CallbackServer> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_AUTH_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    let resolveCode: (code: string) => void;
    let rejectCode: (err: Error) => void;
    const codePromise = new Promise<string>((res, rej) => {
      resolveCode = res;
      rejectCode = rej;
    });

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const code = url.searchParams.get('code');
      if (!code) {
        res.end('No authorization code received.');
        rejectCode(new Error('No authorization code in callback'));
        return;
      }
      res.end('Authentication successful — you can close this tab.');
      resolveCode(code);
    });

    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start local auth server'));
        return;
      }

      const timer = setTimeout(() => {
        server.close();
        rejectCode(new Error(`gas-p auth timed out after ${timeoutMs / 1000}s — no callback received`));
      }, timeoutMs);

      resolve({
        port: address.port,
        awaitCode: () => codePromise.finally(() => clearTimeout(timer)),
        close: () => { clearTimeout(timer); server.close(); },
      });
    });
  });
}

export async function runAuthFlow(client: ClientSecret, scopes: string[]): Promise<Credentials> {
  const { port, awaitCode, close } = await startCallbackServer();
  const redirectUri = `http://localhost:${port}`;
  const oauth2Client = new google.auth.OAuth2(client.clientId, client.clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  console.log('Opening browser for authentication...');
  open(authUrl).catch(() => console.log(`Open this URL manually:\n${authUrl}`));
  const code = await awaitCode();
  close();
  const { tokens } = await oauth2Client.getToken(code);
  if (!isCredentials(tokens)) throw new Error('Unexpected token shape from Google');
  return tokens;
}

export function readScopes(manifestPath: string): string[] {
  const raw = parseJsonFile(manifestPath);
  if (!isManifest(raw)) throw new Error(`appsscript.json at ${manifestPath} is missing a valid oauthScopes array`);
  return raw.oauthScopes;
}
