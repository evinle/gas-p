import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { renderDoGet, renderDoGetBundled, resolveSource } from '../core/harness.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'harness');
const CONTEXT_FIXTURES = join(__dirname, '__fixtures__', 'context');

describe('renderDoGet', () => {
  it('renders the HTML file returned by doGet unchanged when it has no scriptlets', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'plain-html') });
    expect(html).toBe(
      ['<html>', '  <body>', '    <h1>Hello gas-p</h1>', '  </body>', '</html>', ''].join('\n')
    );
  });

  it('HTML-escapes <?= ?> scriptlet output', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'escaped-scriptlet') });
    expect(html).toBe('<p>Hello, &lt;b&gt;World&lt;/b&gt;!</p>\n');
  });

  it('does not escape <?!= ?> scriptlet output', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'unescaped-scriptlet') });
    expect(html).toBe('<p>Hello, <b>World</b>!</p>\n');
  });

  it('strips <?# ?> scriptlet comments entirely from the output', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'comment-scriptlet') });
    expect(html).toBe('<p>Hello, World!</p>\n');
  });

  it('renders a plain HtmlOutput from createHtmlOutputFromFile().setTitle(), matching the real v-reimburse doGet() pattern', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'html-output') });
    expect(html).toBe(
      ['<html>', '  <body>', '    <h1>VReimbursement Portal</h1>', '  </body>', '</html>', ''].join('\n')
    );
  });

  it('injects addMetaTag/setFaviconUrl tags into an existing <head>, matching real Apps Script serving behavior', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'meta-favicon-with-head') });
    expect(html).toBe(
      [
        '<html><head><meta name="viewport" content="width=device-width"/><link rel="shortcut icon" type="image/png" href="https://example.com/icon.png"/></head><body><p>hi</p></body></html>',
      ].join('\n')
    );
  });

  it('creates and prepends a <head> when addMetaTag is used but the content has no <head> of its own', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'meta-favicon-no-head') });
    expect(html).toBe('<head><meta name="viewport" content="width=device-width"/></head><p>hi</p>');
  });

  it('does not persist module-level state across separate renderDoGet calls', () => {
    const counterDir = join(FIXTURES, 'counter');
    const first = renderDoGet({ srcDir: counterDir });
    const second = renderDoGet({ srcDir: counterDir });
    expect(first).toBe('<p>Count: 1</p>\n');
    expect(second).toBe('<p>Count: 1</p>\n');
  });

  it('handles escaped, unescaped, and comment scriptlets together in one template', () => {
    const html = renderDoGet({ srcDir: join(FIXTURES, 'combined-scriptlets') });
    expect(html).toBe(
      [
        '<h1>Welcome to gas-p &amp; friends</h1>',
        '<p>Status: <b>NEW</b></p>',
        '',
        '<p>Escaped again: gas-p &amp; friends</p>',
        '',
      ].join('\n')
    );
  });

  it('throws a ReferenceError when doGet references an undeclared global, matching real Apps Script', () => {
    expect(() => renderDoGet({ srcDir: join(FIXTURES, 'undeclared-global') })).toThrow(ReferenceError);
    expect(() => renderDoGet({ srcDir: join(FIXTURES, 'undeclared-global') })).toThrow(/someUndeclaredService is not defined/);
  });
});

describe('renderDoGetBundled', () => {
  it('throws a host-realm ReferenceError when doGet references an undeclared global in bundled .ts source', async () => {
    const dir = join(CONTEXT_FIXTURES, 'undeclared-global');
    await expect(renderDoGetBundled({ srcDir: dir, entry: 'Code.ts' })).rejects.toThrow(ReferenceError);
    await expect(renderDoGetBundled({ srcDir: dir, entry: 'Code.ts' })).rejects.toThrow(/someUndeclaredService is not defined/);
  });

  it('reads HtmlOutput files from htmlDir instead of srcDir when htmlDir is given', async () => {
    const dir = join(CONTEXT_FIXTURES, 'html-dir-override', 'entry-ts');
    const htmlDir = join(CONTEXT_FIXTURES, 'html-dir-override', 'views');
    const html = await renderDoGetBundled({ srcDir: dir, entry: 'Code.ts', htmlDir });
    expect(html).toBe('<p>from the views dir, not the entry dir</p>\n');
  });
});

describe('resolveSource', () => {
  it('uses the raw .gs/.js path when entry is undefined', async () => {
    const source = resolveSource({ srcDir: join(FIXTURES, 'plain-html') });
    const result = await source.renderDoGet();
    expect(result.html).toBe(
      ['<html>', '  <body>', '    <h1>Hello gas-p</h1>', '  </body>', '</html>', ''].join('\n')
    );
  });

  it("exposes the doGet result's xFrameOptionsMode alongside html, for the Vite plugin to set the served header", async () => {
    const source = resolveSource({ srcDir: join(FIXTURES, 'plain-html') });
    const result = await source.renderDoGet();
    expect(result.xFrameOptionsMode).toBe('DEFAULT');
  });

  it('uses the bundled .ts path when entry is given', async () => {
    const source = resolveSource({ srcDir: join(CONTEXT_FIXTURES, 'multi-file-import'), entry: 'Code.ts' });
    const context = await source.buildContext();
    expect(context.getGreeting('World')).toBe('Hello, World');
  });

  it('threads htmlDir through to the bundled .ts path', async () => {
    const dir = join(CONTEXT_FIXTURES, 'html-dir-override', 'entry-ts');
    const htmlDir = join(CONTEXT_FIXTURES, 'html-dir-override', 'views');
    const source = resolveSource({ srcDir: dir, entry: 'Code.ts', htmlDir });
    const result = await source.renderDoGet();
    expect(result.html).toBe('<p>from the views dir, not the entry dir</p>\n');
  });

  it('threads a per-call user agent through to HtmlService.getUserAgent()', async () => {
    const source = resolveSource({ srcDir: join(FIXTURES, 'plain-html') });
    const context = await source.buildContext('ExampleBrowser/1.0');
    expect(context.HtmlService.getUserAgent()).toBe('ExampleBrowser/1.0');
  });
});
