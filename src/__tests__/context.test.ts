import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { mkdtempSync, rmSync, writeFileSync, cpSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import { build } from 'vite';
import { buildContext, buildBundledContext } from '../core/context.js';
import { GasPNotImplementedError, GasPMissingCredentialsError } from '../errors.js';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

// Wraps vite's real build() in a spy instead of replacing it — the bundled-
// context tests below need actual bundling to happen, just with a call count
// visible for the bundle-cache tests. vi.hoisted is required here since
// vi.mock factories are hoisted above ordinary top-level declarations.
const viteState = vi.hoisted(() => ({ actualBuild: undefined as unknown as typeof import('vite').build }));
vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>();
  viteState.actualBuild = actual.build;
  return { ...actual, build: vi.fn() };
});

// Same call-through-spy shape as the vite mock above, for the raw .gs/.js
// source-compile-cache tests — everything but readFileSync passes through
// to the real fs module untouched.
const fsState = vi.hoisted(() => ({ actualReadFileSync: undefined as unknown as typeof import('fs').readFileSync }));
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  fsState.actualReadFileSync = actual.readFileSync;
  return { ...actual, readFileSync: vi.fn() };
});

const mockExecFileSync = vi.mocked(execFileSync);
const mockBuild = vi.mocked(build);
const mockReadFileSync = vi.mocked(readFileSync);

beforeEach(() => {
  vi.resetAllMocks();
  mockBuild.mockImplementation(viteState.actualBuild);
  mockReadFileSync.mockImplementation(fsState.actualReadFileSync);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'harness');
const CONTEXT_FIXTURES = join(__dirname, '__fixtures__', 'context');
const SESSION_FIXTURES = join(__dirname, '__fixtures__', 'session');
const FIXTURES_FIXTURES = join(__dirname, '__fixtures__', 'fixtures');

describe('buildContext', () => {
  it('throws a clear error when srcDir has no .gs/.js source files', async () => {
    const emptyDir = join(CONTEXT_FIXTURES, 'empty');
    await expect(buildContext({ srcDir: emptyDir })).rejects.toThrow(/No \.gs\/\.js source found in/);
  });

  it('exposes CalendarApp as a sandbox global, gated by devResourceIds', async () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({
      srcDir: dir,
      services: {
        credentialsPath: '/fake/credentials.json',
        clientSecretPath: '/fake/client_secret.json',
        devResourceIds: { CalendarApp: ['cal123'] },
      },
    });
    expect(typeof sandbox.CalendarApp.getCalendarById).toBe('function');
    expect(() => sandbox.CalendarApp.getCalendarById('not-allowlisted')).toThrow(/not-allowlisted/);
  });

  it('exposes Utilities and CacheService as sandbox globals with no services option needed', async () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({ srcDir: dir });
    expect(sandbox.Utilities.base64Decode('aGVsbG8=')).toEqual(Array.from(Buffer.from('hello')));
    sandbox.CacheService.getScriptCache().put('key1', 'value1');
    expect(sandbox.CacheService.getScriptCache().get('key1')).toBe('value1');
  });

  it('exposes UrlFetchApp and Logger as sandbox globals with no services option needed', async () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({ srcDir: dir });
    expect(typeof sandbox.UrlFetchApp.fetch).toBe('function');
    expect(typeof sandbox.Logger.log).toBe('function');
  });

  it('exposes a newly-scaffolded stub-only service (SpreadsheetApp) as a sandbox global that throws GasPNotImplementedError', async () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({ srcDir: dir });
    expect(() => sandbox.SpreadsheetApp.getActiveSpreadsheet()).toThrow(/SpreadsheetApp/);
    expect(() => sandbox.SpreadsheetApp.getActiveSpreadsheet()).toThrow(/getActiveSpreadsheet/);
  });

  it('exposes PropertiesService as a sandbox global with no services option needed', async () => {
    // Only checks reachability, without calling getScriptProperties() — doing
    // so would write a gas-p.properties.json into this committed fixture dir.
    // PropertiesService.test.ts covers read/write behavior against a scratch copy.
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({ srcDir: dir });
    expect(typeof sandbox.PropertiesService.getScriptProperties).toBe('function');
  });

  it('exposes Session as a sandbox global, gated by the services option', async () => {
    const dir = join(SESSION_FIXTURES, 'basic');
    const sandbox = await buildContext({
      srcDir: dir,
      services: {
        credentialsPath: '/fake/credentials.json',
        clientSecretPath: '/fake/client_secret.json',
      },
    });
    expect(sandbox.Session.getScriptTimeZone()).toBe('America/New_York');
  });

  it('reads HtmlOutput/template files from htmlDir instead of srcDir when htmlDir is given', async () => {
    const dir = join(CONTEXT_FIXTURES, 'html-dir-override', 'entry');
    const htmlDir = join(CONTEXT_FIXTURES, 'html-dir-override', 'views');
    const sandbox = await buildContext({ srcDir: dir, htmlDir });
    expect(sandbox.HtmlService.createHtmlOutputFromFile('index').getContent()).toBe(
      '<p>from the views dir, not the entry dir</p>\n'
    );
  });

  it('exposes the given user agent via HtmlService.getUserAgent()', async () => {
    const dir = join(FIXTURES, 'counter');
    const sandbox = await buildContext({ srcDir: dir }, 'ExampleBrowser/1.0');
    expect(sandbox.HtmlService.getUserAgent()).toBe('ExampleBrowser/1.0');
  });

  describe('Declared Fixtures', () => {
    it('answers a stub-only method call from gas-p.fixtures.ts instead of throwing GasPNotImplementedError', async () => {
      const dir = join(FIXTURES, 'counter');
      const fixturesFile = join(FIXTURES_FIXTURES, 'basic', 'gas-p.fixtures.ts');
      const sandbox = await buildContext({ srcDir: dir, fixturesFile });
      expect(sandbox.SpreadsheetApp.someUnimplementedMethod()).toBe('a static value');
    });

    it('leaves a stub-only method with no matching fixture throwing GasPNotImplementedError, unchanged', async () => {
      const dir = join(FIXTURES, 'counter');
      const fixturesFile = join(FIXTURES_FIXTURES, 'basic', 'gas-p.fixtures.ts');
      const sandbox = await buildContext({ srcDir: dir, fixturesFile });
      expect(() => sandbox.SpreadsheetApp.getActiveSpreadsheet()).toThrow(GasPNotImplementedError);
    });

    it('behaves exactly as today when no fixturesFile is given', async () => {
      const dir = join(FIXTURES, 'counter');
      const sandbox = await buildContext({ srcDir: dir });
      expect(() => sandbox.SpreadsheetApp.getActiveSpreadsheet()).toThrow(GasPNotImplementedError);
    });

    it('ignores a fixture mistakenly declared for a fully-local/real service (Utilities)', async () => {
      const dir = join(FIXTURES, 'counter');
      const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
      const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
      try {
        writeFileSync(fixturesFile, "export default { Utilities: { base64Decode: 'should not apply' } };");
        const sandbox = await buildContext({ srcDir: dir, fixturesFile });
        expect(sandbox.Utilities.base64Decode('aGVsbG8=')).toEqual(Array.from(Buffer.from('hello')));
      } finally {
        rmSync(scratchDir, { recursive: true, force: true });
      }
    });

    it('reads gas-p.fixtures.ts fresh on every buildContext call — editing it between calls changes the next answer', async () => {
      const dir = join(FIXTURES, 'counter');
      const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
      const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
      try {
        writeFileSync(fixturesFile, "export default { SpreadsheetApp: { someUnimplementedMethod: 'first' } };");
        const first = await buildContext({ srcDir: dir, fixturesFile });
        expect(first.SpreadsheetApp.someUnimplementedMethod()).toBe('first');

        writeFileSync(fixturesFile, "export default { SpreadsheetApp: { someUnimplementedMethod: 'second' } };");
        const second = await buildContext({ srcDir: dir, fixturesFile });
        expect(second.SpreadsheetApp.someUnimplementedMethod()).toBe('second');
      } finally {
        rmSync(scratchDir, { recursive: true, force: true });
      }
    });

    it('exposes CalendarApp/Session as sandbox globals with no services option at all', async () => {
      const dir = join(FIXTURES, 'counter');
      const sandbox = await buildContext({ srcDir: dir });
      expect(typeof sandbox.CalendarApp.getCalendarById).toBe('function');
      expect(typeof sandbox.Session.getActiveUser).toBe('function');
    });

    it('answers a CalendarApp stub-only method call from a fixture with no credentials configured', async () => {
      const dir = join(FIXTURES, 'counter');
      const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
      const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
      try {
        writeFileSync(fixturesFile, "export default { CalendarApp: { getEventById: (id) => ({ id }) } };");
        const sandbox = await buildContext({ srcDir: dir, fixturesFile });
        expect(sandbox.CalendarApp.getEventById('evt1')).toEqual({ id: 'evt1' });
      } finally {
        rmSync(scratchDir, { recursive: true, force: true });
      }
    });

    it('Session.getActiveUser() throws GasPMissingCredentialsError with no fixture and no credentials', async () => {
      const dir = join(FIXTURES, 'counter');
      const sandbox = await buildContext({ srcDir: dir });
      expect(() => sandbox.Session.getActiveUser()).toThrow(GasPMissingCredentialsError);
    });

    it('Session.getActiveUser() returns the fixture value when no credentials are configured', async () => {
      const dir = join(FIXTURES, 'counter');
      const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
      const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
      try {
        writeFileSync(fixturesFile, "export default { Session: { getActiveUser: 'fixture-user' } };");
        const sandbox = await buildContext({ srcDir: dir, fixturesFile });
        expect(sandbox.Session.getActiveUser()).toBe('fixture-user');
      } finally {
        rmSync(scratchDir, { recursive: true, force: true });
      }
    });

    it('Session.getActiveUser() prefers the fixture over real credentials when both are available', async () => {
      const dir = join(SESSION_FIXTURES, 'basic');
      const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
      const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
      try {
        writeFileSync(fixturesFile, "export default { Session: { getActiveUser: 'fixture-user' } };");
        const sandbox = await buildContext({
          srcDir: dir,
          fixturesFile,
          services: { credentialsPath: '/fake/credentials.json', clientSecretPath: '/fake/client_secret.json' },
        });
        expect(sandbox.Session.getActiveUser()).toBe('fixture-user');
        expect(mockExecFileSync).not.toHaveBeenCalled();
      } finally {
        rmSync(scratchDir, { recursive: true, force: true });
      }
    });

    it('Session.getScriptTimeZone() is unaffected, with or without credentials configured', async () => {
      const dir = join(SESSION_FIXTURES, 'basic');
      const sandbox = await buildContext({ srcDir: dir });
      expect(sandbox.Session.getScriptTimeZone()).toBe('America/New_York');
    });

    it('CalendarApp.getCalendarById()/getDefaultCalendar() are unaffected, still gated by devResourceIds, with no credentials configured', async () => {
      const dir = join(FIXTURES, 'counter');
      const sandbox = await buildContext({ srcDir: dir });
      expect(() => sandbox.CalendarApp.getCalendarById('not-allowlisted')).toThrow(/not-allowlisted/);
      expect(() => sandbox.CalendarApp.getDefaultCalendar()).toThrow(/primary/);
    });
  });

  describe('source caching', () => {
    let scratchDir: string;

    beforeEach(() => {
      scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-source-cache-'));
      writeFileSync(join(scratchDir, 'Code.gs'), 'function getGreeting(name) {\n  return "Hello, " + name;\n}\n');
    });

    afterEach(() => {
      rmSync(scratchDir, { recursive: true, force: true });
    });

    it('reuses the compiled source across two calls when the file has not changed', async () => {
      await buildContext({ srcDir: scratchDir });
      mockReadFileSync.mockClear();

      await buildContext({ srcDir: scratchDir });
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('recompiles when the source file changes between calls, and reflects the new source', async () => {
      await buildContext({ srcDir: scratchDir });

      writeFileSync(join(scratchDir, 'Code.gs'), 'function getGreeting(name) {\n  return "Howdy there, " + name;\n}\n');

      const sandbox = await buildContext({ srcDir: scratchDir });
      expect(sandbox.getGreeting('World')).toBe('Howdy there, World');
    });

    it('does not leak module-level state between two calls with unchanged, cached source', async () => {
      writeFileSync(join(scratchDir, 'Code.gs'), 'var counter = 0;\nfunction increment() {\n  counter++;\n  return counter;\n}\n');

      const first = await buildContext({ srcDir: scratchDir });
      expect(first.increment()).toBe(1);

      mockReadFileSync.mockClear();
      const second = await buildContext({ srcDir: scratchDir });
      expect(mockReadFileSync).not.toHaveBeenCalled(); // confirms this case actually hit the cache
      expect(second.increment()).toBe(1);
    });
  });
});

describe('buildBundledContext', () => {
  it('resolves a real import between two .ts files and executes the result', async () => {
    const dir = join(CONTEXT_FIXTURES, 'multi-file-import');
    const sandbox = await buildBundledContext({ srcDir: dir, entry: 'Code.ts' });
    expect(sandbox.getGreeting('World')).toBe('Hello, World');
  });

  it('resolves an import against a path alias from the consumer\'s own Vite config', async () => {
    const dir = join(CONTEXT_FIXTURES, 'consumer-config-alias');
    const sandbox = await buildBundledContext({
      srcDir: dir,
      entry: 'Code.ts',
      consumerConfig: { resolve: { alias: { '@utils': join(dir, 'Utils.ts') } } },
    });
    expect(sandbox.getGreeting('World')).toBe('Hello, World');
  });

  it('preserves an unreferenced, unexported top-level function as a callable global', async () => {
    // Apps Script functions like doGet are implicit globals with no export —
    // a bundler's tree-shaker/minifier sees an unreferenced top-level function
    // as dead code and will silently drop it unless explicitly disabled.
    const dir = join(CONTEXT_FIXTURES, 'unreferenced-toplevel-fn');
    const sandbox = await buildBundledContext({ srcDir: dir, entry: 'Code.ts' });
    expect(sandbox.doGet()).toBe('unused by anything else in this bundle');
  });

  it('reads HtmlOutput/template files from htmlDir instead of srcDir when htmlDir is given', async () => {
    const dir = join(CONTEXT_FIXTURES, 'html-dir-override', 'entry-ts');
    const htmlDir = join(CONTEXT_FIXTURES, 'html-dir-override', 'views');
    const sandbox = await buildBundledContext({ srcDir: dir, entry: 'Code.ts', htmlDir });
    expect(sandbox.HtmlService.createHtmlOutputFromFile('index').getContent()).toBe(
      '<p>from the views dir, not the entry dir</p>\n'
    );
  });

  it('answers a stub-only method call from gas-p.fixtures.ts, same as buildContext', async () => {
    const dir = join(CONTEXT_FIXTURES, 'multi-file-import');
    const fixturesFile = join(FIXTURES_FIXTURES, 'basic', 'gas-p.fixtures.ts');
    const sandbox = await buildBundledContext({ srcDir: dir, entry: 'Code.ts', fixturesFile });
    expect(sandbox.SpreadsheetApp.someUnimplementedMethod()).toBe('a static value');
  });

  describe('bundle caching', () => {
    // Each test gets its own scratch copy of the fixture (never the committed
    // multi-file-import dir directly) — the bundle cache is keyed by srcDir,
    // and other tests in this file already build against that shared,
    // committed dir, so reusing it here would start these tests with a warm
    // cache instead of the cold one each case actually wants to assert on.
    let scratchDir: string;

    beforeEach(() => {
      scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-bundle-cache-'));
      cpSync(join(CONTEXT_FIXTURES, 'multi-file-import'), scratchDir, { recursive: true });
    });

    afterEach(() => {
      rmSync(scratchDir, { recursive: true, force: true });
    });

    it('reuses the cached bundle across two calls when the source has not changed', async () => {
      await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });
      await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });
      expect(mockBuild).toHaveBeenCalledTimes(1);
    });

    it('rebuilds when a source file changes between calls, and reflects the new source', async () => {
      await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });

      writeFileSync(
        join(scratchDir, 'Utils.ts'),
        "export function greetingFor(name: string): string {\n  return 'Howdy there, ' + name;\n}\n"
      );

      const sandbox = await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });
      expect(mockBuild).toHaveBeenCalledTimes(2);
      expect(sandbox.getGreeting('World')).toBe('Howdy there, World');
    });

    it('does not reuse the cached bundle when consumerConfig differs, even with the same srcDir+entry', async () => {
      writeFileSync(
        join(scratchDir, 'Code.ts'),
        "import { greetingFor } from '@utils';\nfunction getGreeting(name: string) {\n  return greetingFor(name);\n}\n"
      );
      writeFileSync(
        join(scratchDir, 'UtilsA.ts'),
        "export function greetingFor(name: string): string {\n  return 'Hello from A, ' + name;\n}\n"
      );
      writeFileSync(
        join(scratchDir, 'UtilsB.ts'),
        "export function greetingFor(name: string): string {\n  return 'Hello from B, ' + name;\n}\n"
      );

      const first = await buildBundledContext({
        srcDir: scratchDir,
        entry: 'Code.ts',
        consumerConfig: { resolve: { alias: { '@utils': join(scratchDir, 'UtilsA.ts') } } },
      });
      expect(first.getGreeting('World')).toBe('Hello from A, World');

      const second = await buildBundledContext({
        srcDir: scratchDir,
        entry: 'Code.ts',
        consumerConfig: { resolve: { alias: { '@utils': join(scratchDir, 'UtilsB.ts') } } },
      });
      expect(mockBuild).toHaveBeenCalledTimes(2); // proves the second call wasn't served from A's cache entry
      expect(second.getGreeting('World')).toBe('Hello from B, World');
    });

    it('does not leak module-level state between two calls with unchanged, cached source', async () => {
      writeFileSync(
        join(scratchDir, 'Code.ts'),
        'let counter = 0;\nfunction increment() {\n  counter++;\n  return counter;\n}\n'
      );

      const first = await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });
      expect(first.increment()).toBe(1);

      const second = await buildBundledContext({ srcDir: scratchDir, entry: 'Code.ts' });
      expect(mockBuild).toHaveBeenCalledTimes(1); // confirms the bundle actually was cached for this case
      expect(second.increment()).toBe(1);
    });
  });
});
