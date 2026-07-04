import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { renderDoGet, renderDoGetBundled } from '../core/harness.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'harness');
const CONTEXT_FIXTURES = join(__dirname, '__fixtures__', 'context');

describe('renderDoGet', () => {
  it('renders the HTML file returned by doGet unchanged when it has no scriptlets', () => {
    const html = renderDoGet(join(FIXTURES, 'plain-html'));
    expect(html).toBe(
      ['<html>', '  <body>', '    <h1>Hello gas-p</h1>', '  </body>', '</html>', ''].join('\n')
    );
  });

  it('HTML-escapes <?= ?> scriptlet output', () => {
    const html = renderDoGet(join(FIXTURES, 'escaped-scriptlet'));
    expect(html).toBe('<p>Hello, &lt;b&gt;World&lt;/b&gt;!</p>\n');
  });

  it('does not escape <?!= ?> scriptlet output', () => {
    const html = renderDoGet(join(FIXTURES, 'unescaped-scriptlet'));
    expect(html).toBe('<p>Hello, <b>World</b>!</p>\n');
  });

  it('strips <?# ?> scriptlet comments entirely from the output', () => {
    const html = renderDoGet(join(FIXTURES, 'comment-scriptlet'));
    expect(html).toBe('<p>Hello, World!</p>\n');
  });

  it('does not persist module-level state across separate renderDoGet calls', () => {
    const counterDir = join(FIXTURES, 'counter');
    const first = renderDoGet(counterDir);
    const second = renderDoGet(counterDir);
    expect(first).toBe('<p>Count: 1</p>\n');
    expect(second).toBe('<p>Count: 1</p>\n');
  });

  it('handles escaped, unescaped, and comment scriptlets together in one template', () => {
    const html = renderDoGet(join(FIXTURES, 'combined-scriptlets'));
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
    expect(() => renderDoGet(join(FIXTURES, 'undeclared-global'))).toThrow(ReferenceError);
    expect(() => renderDoGet(join(FIXTURES, 'undeclared-global'))).toThrow(/someUndeclaredService is not defined/);
  });
});

describe('renderDoGetBundled', () => {
  it('throws a host-realm ReferenceError when doGet references an undeclared global in bundled .ts source', async () => {
    const dir = join(CONTEXT_FIXTURES, 'undeclared-global');
    await expect(renderDoGetBundled(dir, 'Code.ts')).rejects.toThrow(ReferenceError);
    await expect(renderDoGetBundled(dir, 'Code.ts')).rejects.toThrow(/someUndeclaredService is not defined/);
  });
});
