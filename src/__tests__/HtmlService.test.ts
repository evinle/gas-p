import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { buildContext } from '../core/context.js';
import { GasPNotImplementedError } from '../errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, '__fixtures__', 'htmlservice', 'basic');

describe('HtmlService.createHtmlOutputFromFile()', () => {
  it('returns an HtmlOutput with the raw file contents, unprocessed', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutputFromFile('index');
    expect(output.getContent()).toBe(
      ['<html>', '  <body>', '    <h1>Hello from a plain HtmlOutput</h1>', '  </body>', '</html>', ''].join('\n')
    );
  });

  it('setTitle is chainable and the title is retrievable via getTitle', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutputFromFile('index');
    const returned = output.setTitle('VReimbursement Portal');
    expect(returned).toBe(output);
    expect(output.getTitle()).toBe('VReimbursement Portal');
  });
});

describe('HtmlService.createHtmlOutput()', () => {
  it('returns an HtmlOutput wrapping the given HTML string, with no file read', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    expect(output.getContent()).toBe('<p>hi</p>');
  });
});

describe('HtmlOutput.append()', () => {
  it('appends content as-is, unescaped, and is chainable', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.append('<b>more</b>');
    expect(returned).toBe(output);
    expect(output.getContent()).toBe('<p>hi</p><b>more</b>');
  });
});

describe('HtmlOutput.appendUntrusted()', () => {
  it('HTML-escapes the appended content and is chainable', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.appendUntrusted('<script>evil()</script>');
    expect(returned).toBe(output);
    expect(output.getContent()).toBe('<p>hi</p>&lt;script&gt;evil()&lt;/script&gt;');
  });
});

describe('HtmlOutput width/height', () => {
  it('default to null and are settable/gettable, chainably', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    expect(output.getWidth()).toBeNull();
    expect(output.getHeight()).toBeNull();

    const returned = output.setWidth(400).setHeight(300);
    expect(returned).toBe(output);
    expect(output.getWidth()).toBe(400);
    expect(output.getHeight()).toBe(300);
  });
});

describe('HtmlOutput favicon URL', () => {
  it('defaults to null and is settable/gettable, chainably', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    expect(output.getFaviconUrl()).toBeNull();

    const returned = output.setFaviconUrl('https://example.com/favicon.ico');
    expect(returned).toBe(output);
    expect(output.getFaviconUrl()).toBe('https://example.com/favicon.ico');
  });
});

describe('HtmlOutput meta tags', () => {
  it('addMetaTag is chainable and getMetaTags returns entries with getName()/getContent()', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    expect(output.getMetaTags()).toEqual([]);

    const returned = output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    expect(returned).toBe(output);

    const tags = output.getMetaTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].getName()).toBe('viewport');
    expect(tags[0].getContent()).toBe('width=device-width, initial-scale=1');
  });
});

describe('HtmlOutput.setSandboxMode()', () => {
  it('is a chainable no-op, per the "now has no effect" docs', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.setSandboxMode(sandbox.HtmlService.SandboxMode.IFRAME);
    expect(returned).toBe(output);
  });
});

describe('HtmlOutput.setXFrameOptionsMode()', () => {
  it('is chainable and accepts HtmlService.XFrameOptionsMode values', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.setXFrameOptionsMode(sandbox.HtmlService.XFrameOptionsMode.ALLOWALL);
    expect(returned).toBe(output);
  });

  it('defaults to DEFAULT, and stores ALLOWALL once set, retrievable via getXFrameOptionsMode()', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    expect(output.getXFrameOptionsMode()).toBe(sandbox.HtmlService.XFrameOptionsMode.DEFAULT);

    output.setXFrameOptionsMode(sandbox.HtmlService.XFrameOptionsMode.ALLOWALL);
    expect(output.getXFrameOptionsMode()).toBe(sandbox.HtmlService.XFrameOptionsMode.ALLOWALL);
  });
});

describe('HtmlOutput.clear() and setContent()', () => {
  it('clear() empties the content and is chainable', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.clear();
    expect(returned).toBe(output);
    expect(output.getContent()).toBe('');
  });

  it('setContent() replaces the content and is chainable', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const returned = output.setContent('<p>replaced</p>');
    expect(returned).toBe(output);
    expect(output.getContent()).toBe('<p>replaced</p>');
  });
});

describe('HtmlOutput.asTemplate()', () => {
  it('returns an HtmlTemplate backed by the HtmlOutput, reflecting later changes to it', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>2 + 2 = <?= 2 + 2 ?></p>');
    const template = output.asTemplate();

    output.setContent('<p>3 + 3 = <?= 3 + 3 ?></p>');

    expect(template.getRawContent()).toBe('<p>3 + 3 = <?= 3 + 3 ?></p>');
    expect(template.evaluate().getContent()).toBe('<p>3 + 3 = 6</p>');
  });
});

describe('HtmlService.getUserAgent()', () => {
  it('returns the user agent threaded in from the harness, when one is given', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE }, 'ExampleBrowser/1.0');
    expect(sandbox.HtmlService.getUserAgent()).toBe('ExampleBrowser/1.0');
  });

  it('returns undefined when no user agent was given (e.g. an RPC call with no real request context)', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    expect(sandbox.HtmlService.getUserAgent()).toBeUndefined();
  });
});

describe('HtmlOutput.getBlob() and getAs()', () => {
  it('getBlob() wraps the content in a Blob with text/html content type', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const blob = output.getBlob();
    expect(blob.getDataAsString()).toBe('<p>hi</p>');
    expect(blob.getContentType()).toBe('text/html');
  });

  it('getAs(contentType) wraps the content in a Blob with the requested content type', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createHtmlOutput('<p>hi</p>');
    const blob = output.getAs('application/octet-stream');
    expect(blob.getContentType()).toBe('application/octet-stream');
  });
});

describe('HtmlService.createTemplate()', () => {
  it('evaluates scriptlets in a literal string the same way createTemplateFromFile does for a file', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const output = sandbox.HtmlService.createTemplate('<p>2 + 2 = <?= 2 + 2 ?></p>').evaluate();
    expect(output.getContent()).toBe('<p>2 + 2 = 4</p>');
  });
});

describe('HtmlTemplate.getRawContent()', () => {
  it('returns the original, unprocessed template string, scriptlets and all', async () => {
    const sandbox = await buildContext({ srcDir: FIXTURE });
    const template = sandbox.HtmlService.createTemplate('<p>2 + 2 = <?= 2 + 2 ?></p>');
    expect(template.getRawContent()).toBe('<p>2 + 2 = <?= 2 + 2 ?></p>');
  });
});
