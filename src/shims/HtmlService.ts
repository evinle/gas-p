import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HtmlServiceStubs } from './generated/HtmlService.stubs.js';
import { HtmlOutputStubs } from './generated/HtmlOutput.stubs.js';
import { HtmlTemplateStubs } from './generated/HtmlTemplate.stubs.js';

export interface HtmlOutput {
  getContent(): string;
  getTitle?(): string | undefined;
  setTitle?(title: string): HtmlOutput;
  append?(addedContent: string): HtmlOutput;
  addMetaTag?(name: string, content: string): HtmlOutput;
  setFaviconUrl?(iconUrl: string): HtmlOutput;
  setXFrameOptionsMode?(mode: string): HtmlOutput;
}

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

function createHtmlOutput(content: string): HtmlOutput {
  let title: string | undefined;
  const output: HtmlOutput = {
    ...HtmlOutputStubs,
    getContent: () => content,
    getTitle: () => title,
    setTitle(newTitle: string): HtmlOutput {
      title = newTitle;
      return output;
    },
  };
  return output;
}

function createHtmlTemplate(raw: string, context: vm.Context) {
  return {
    ...HtmlTemplateStubs,
    evaluate(): HtmlOutput {
      return { getContent: () => evaluateTemplate(raw, context) };
    },
  };
}

// createTemplateFromFile's evaluate() needs a live reference to the sandbox's
// own vm.Context to run <?= ?> scriptlet expressions against the script's own
// globals — unlike the rest of this shim, it can't be decoupled from the vm.
export function createHtmlService(srcDir: string, context: vm.Context) {
  return {
    ...HtmlServiceStubs,
    createTemplateFromFile(filename: string) {
      const raw = readFileSync(join(srcDir, `${filename}.html`), 'utf-8');
      return createHtmlTemplate(raw, context);
    },
    createHtmlOutputFromFile(filename: string): HtmlOutput {
      const content = readFileSync(join(srcDir, `${filename}.html`), 'utf-8');
      return createHtmlOutput(content);
    },
    createHtmlOutput(html = ''): HtmlOutput {
      return createHtmlOutput(html);
    },
  };
}
