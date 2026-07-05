import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HtmlServiceStubs } from './generated/HtmlService.stubs.js';
import { HtmlOutputStubs } from './generated/HtmlOutput.stubs.js';
import { HtmlTemplateStubs } from './generated/HtmlTemplate.stubs.js';

export function isHtmlOutput(x: unknown): x is HtmlOutput {
  if (typeof x !== 'object' || x === null) return false;
  if (!('getContent' in x)) return false;
  return typeof Reflect.get(x, 'getContent') === 'function';
}

const SCRIPTLET_PATTERN = /<\?(=|!=|#)([\s\S]*?)\?>/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function evaluateTemplate(raw: string, context: vm.Context): string {
  return raw.replace(SCRIPTLET_PATTERN, (_match, tag: string, expr: string) => {
    if (tag === '#') return '';
    const value = String(vm.runInContext(expr, context));
    return tag === '=' ? escapeHtml(value) : value;
  });
}

export class HtmlOutput extends HtmlOutputStubs {
  private title: string | undefined;

  constructor(private content: string) {
    super();
  }

  getContent(): string {
    return this.content;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  setTitle(newTitle: string): HtmlOutput {
    this.title = newTitle;
    return this;
  }
}

class HtmlTemplate extends HtmlTemplateStubs {
  constructor(
    private raw: string,
    private context: vm.Context
  ) {
    super();
  }

  evaluate(): HtmlOutput {
    return new HtmlOutput(evaluateTemplate(this.raw, this.context));
  }

  // "Returns the unprocessed content of this template." — HtmlTemplate docs.
  getRawContent(): string {
    return this.raw;
  }
}

// createTemplateFromFile's evaluate() needs a live reference to the sandbox's
// own vm.Context to run <?= ?> scriptlet expressions against the script's own
// globals — unlike the rest of this shim, it can't be decoupled from the vm.
export class HtmlService extends HtmlServiceStubs {
  constructor(
    private srcDir: string,
    private context: vm.Context
  ) {
    super();
  }

  createTemplateFromFile(filename: string) {
    const raw = readFileSync(join(this.srcDir, `${filename}.html`), 'utf-8');
    return new HtmlTemplate(raw, this.context);
  }

  // "Creates a new HtmlTemplate object that can be returned from the
  // script." — HtmlService docs. Same scriptlet evaluation as
  // createTemplateFromFile, just from a literal string instead of a file.
  createTemplate(html: string) {
    return new HtmlTemplate(html, this.context);
  }

  createHtmlOutputFromFile(filename: string): HtmlOutput {
    const content = readFileSync(join(this.srcDir, `${filename}.html`), 'utf-8');
    return new HtmlOutput(content);
  }

  createHtmlOutput(html = ''): HtmlOutput {
    return new HtmlOutput(html);
  }
}
