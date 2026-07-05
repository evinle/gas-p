import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { buildContext, buildBundledContext } from '../core/context.js';
import { GasPNotImplementedError } from '../errors.js';

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
});
