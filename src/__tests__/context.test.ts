import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { buildContext, buildBundledContext } from '../core/context.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'harness');
const CONTEXT_FIXTURES = join(__dirname, '__fixtures__', 'context');
const SESSION_FIXTURES = join(__dirname, '__fixtures__', 'session');

describe('buildContext', () => {
  it('throws a clear error when srcDir has no .gs/.js source files', () => {
    const emptyDir = join(CONTEXT_FIXTURES, 'empty');
    expect(() => buildContext(emptyDir)).toThrow(/No \.gs\/\.js source found in/);
  });

  it('exposes CalendarApp as a sandbox global, gated by devResourceIds', () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = buildContext(dir, {
      credentialsPath: '/fake/credentials.json',
      clientSecretPath: '/fake/client_secret.json',
      devResourceIds: { CalendarApp: ['cal123'] },
    });
    expect(typeof sandbox.CalendarApp.getCalendarById).toBe('function');
    expect(() => sandbox.CalendarApp.getCalendarById('not-allowlisted')).toThrow(/not-allowlisted/);
  });

  it('exposes Utilities and CacheService as sandbox globals with no services option needed', () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = buildContext(dir);
    expect(sandbox.Utilities.base64Decode('aGVsbG8=')).toEqual(Array.from(Buffer.from('hello')));
    sandbox.CacheService.getScriptCache().put('key1', 'value1');
    expect(sandbox.CacheService.getScriptCache().get('key1')).toBe('value1');
  });

  it('exposes Session as a sandbox global, gated by the services option', () => {
    const dir = join(SESSION_FIXTURES, 'basic');
    const sandbox = buildContext(dir, {
      credentialsPath: '/fake/credentials.json',
      clientSecretPath: '/fake/client_secret.json',
    });
    expect(sandbox.Session.getScriptTimeZone()).toBe('America/New_York');
  });
});

describe('buildBundledContext', () => {
  it('resolves a real import between two .ts files and executes the result', async () => {
    const dir = join(CONTEXT_FIXTURES, 'multi-file-import');
    const sandbox = await buildBundledContext(dir, 'Code.ts');
    expect(sandbox.getGreeting('World')).toBe('Hello, World');
  });

  it('resolves an import against a path alias from the consumer\'s own Vite config', async () => {
    const dir = join(CONTEXT_FIXTURES, 'consumer-config-alias');
    const sandbox = await buildBundledContext(dir, 'Code.ts', {
      resolve: { alias: { '@utils': join(dir, 'Utils.ts') } },
    });
    expect(sandbox.getGreeting('World')).toBe('Hello, World');
  });

  it('preserves an unreferenced, unexported top-level function as a callable global', async () => {
    // Apps Script functions like doGet are implicit globals with no export —
    // a bundler's tree-shaker/minifier sees an unreferenced top-level function
    // as dead code and will silently drop it unless explicitly disabled.
    const dir = join(CONTEXT_FIXTURES, 'unreferenced-toplevel-fn');
    const sandbox = await buildBundledContext(dir, 'Code.ts');
    expect(sandbox.doGet()).toBe('unused by anything else in this bundle');
  });
});
