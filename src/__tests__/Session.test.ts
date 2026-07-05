import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { GasPNotImplementedError, GasPMissingCredentialsError } from '../errors.js';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_SRC_DIR = join(__dirname, '__fixtures__', 'session', 'basic');

const CREDENTIALS = { credentialsPath: '/fake/credentials.json', clientSecretPath: '/fake/client_secret.json' };

beforeEach(() => { vi.resetAllMocks(); });

describe('Session.getScriptTimeZone()', () => {
  it("reads the timeZone field from the project's appsscript.json", async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(CREDENTIALS, FIXTURE_SRC_DIR);
    expect(session.getScriptTimeZone()).toBe('America/New_York');
  });
});

describe('Session.getActiveUser().getEmail()', () => {
  it("returns the authenticated dev's email from the userinfo endpoint", async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ email: 'dev@example.com' }));
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(CREDENTIALS, FIXTURE_SRC_DIR);
    expect(session.getActiveUser().getEmail()).toBe('dev@example.com');
  });
});

describe('Session construction without credentials', () => {
  it('constructs successfully with credentials undefined', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    expect(() => new SessionClass(undefined, FIXTURE_SRC_DIR)).not.toThrow();
  });

  it('getScriptTimeZone() keeps working with no credentials configured', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(undefined, FIXTURE_SRC_DIR);
    expect(session.getScriptTimeZone()).toBe('America/New_York');
  });

  it('getActiveUser() throws GasPMissingCredentialsError, not GasPNotImplementedError or a raw crash', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(undefined, FIXTURE_SRC_DIR);
    expect(() => session.getActiveUser()).toThrow(GasPMissingCredentialsError);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });
});

describe('Session unimplemented methods', () => {
  it('getEffectiveUser throws GasPNotImplementedError', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(CREDENTIALS, FIXTURE_SRC_DIR);
    expect(() => session.getEffectiveUser()).toThrow(GasPNotImplementedError);
  });

  it('getActiveUserLocale throws GasPNotImplementedError', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(CREDENTIALS, FIXTURE_SRC_DIR);
    expect(() => session.getActiveUserLocale()).toThrow(GasPNotImplementedError);
  });

  it('getTemporaryActiveUserKey throws GasPNotImplementedError', async () => {
    const { Session: SessionClass } = await import('../shims/Session.js');
    const session = new SessionClass(CREDENTIALS, FIXTURE_SRC_DIR);
    expect(() => session.getTemporaryActiveUserKey()).toThrow(GasPNotImplementedError);
  });
});
