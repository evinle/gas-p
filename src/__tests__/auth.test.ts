import { describe, it, expect } from 'vitest';
import { readScopes, readClientSecret, readStoredCredentials, buildOAuth2Client, startCallbackServer } from '../auth.js';
import type { ClientSecret } from '../auth.js';
import { writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const fixtures = join(__dirname, '__fixtures__');

describe('readClientSecret', () => {
  it('returns clientId and clientSecret from a Google credentials JSON', () => {
    const result: ClientSecret = readClientSecret(join(fixtures, 'client_secret.json'));
    expect(result).toEqual({ clientId: 'my-client-id', clientSecret: 'my-client-secret' });
  });

  it('throws mentioning client_id and the file path when the file is malformed', () => {
    const dir = join(tmpdir(), `gas-p-test-${process.pid}`);
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'client_secret.json');
    writeFileSync(path, JSON.stringify({ something: 'wrong' }));

    expect(() => readClientSecret(path)).toThrow(/client_id/);
    expect(() => readClientSecret(path)).toThrow(path);
  });
});

describe('startCallbackServer', () => {
  it('resolves the code when the callback URL is hit with ?code=', async () => {
    const { port, awaitCode, close } = await startCallbackServer();

    fetch(`http://localhost:${port}?code=test-auth-code`);
    const code = await awaitCode();
    close();

    expect(code).toBe('test-auth-code');
  });

  it('rejects with a timeout error when no callback arrives within timeoutMs', async () => {
    const { awaitCode } = await startCallbackServer({ timeoutMs: 50 });
    await expect(awaitCode()).rejects.toThrow(/timed out/);
  });
});

describe('buildOAuth2Client', () => {
  it('returns an OAuth2Client with stored credentials set', () => {
    const clientSecret = readClientSecret(join(fixtures, 'client_secret.json'));
    const credentials = readStoredCredentials(join(fixtures, 'credentials.json'))!;
    const client = buildOAuth2Client(clientSecret, credentials);

    expect(client.credentials.access_token).toBe('ya29.test-access-token');
    expect(client.credentials.refresh_token).toBe('1//test-refresh-token');
  });
});

describe('readStoredCredentials', () => {
  it('returns credentials when credentials.json exists', () => {
    const result = readStoredCredentials(join(fixtures, 'credentials.json'));
    expect(result).toMatchObject({
      access_token: 'ya29.test-access-token',
      refresh_token: '1//test-refresh-token',
    });
  });

  it('returns null when credentials.json does not exist', () => {
    expect(readStoredCredentials('/nonexistent/credentials.json')).toBeNull();
  });
});

describe('readScopes', () => {
  it('returns oauthScopes from a valid appsscript.json', () => {
    expect(readScopes(join(fixtures, 'appsscript.json'))).toEqual([
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
    ]);
  });

  it('throws mentioning oauthScopes and the file path when oauthScopes is absent', () => {
    const dir = join(tmpdir(), `gas-p-test-${process.pid}`);
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'appsscript.json');
    writeFileSync(path, JSON.stringify({ timeZone: 'America/New_York' }));

    expect(() => readScopes(path)).toThrow(/oauthScopes/);
    expect(() => readScopes(path)).toThrow(path);
  });

  it('throws when appsscript.json does not exist', () => {
    expect(() => readScopes('/nonexistent/path/appsscript.json')).toThrow();
  });

  it('throws mentioning the file path when appsscript.json is empty or invalid JSON', () => {
    const dir = join(tmpdir(), `gas-p-test-${process.pid}-empty`);
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'appsscript.json');
    writeFileSync(path, '');
    expect(() => readScopes(path)).toThrow(path);
  });
});
