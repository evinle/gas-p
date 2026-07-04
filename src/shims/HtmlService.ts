import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GasPNotImplementedError } from '../errors.js';

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

function makeHtmlOutput(content: string): HtmlOutput {
  let title: string | undefined;
  const output: HtmlOutput = {
    getContent: () => content,
    getTitle: () => title,
    setTitle(newTitle: string): HtmlOutput {
      title = newTitle;
      return output;
    },
    append(): never {
      throw new GasPNotImplementedError('HtmlOutput', 'append');
    },
    addMetaTag(): never {
      throw new GasPNotImplementedError('HtmlOutput', 'addMetaTag');
    },
    setFaviconUrl(): never {
      throw new GasPNotImplementedError('HtmlOutput', 'setFaviconUrl');
    },
    setXFrameOptionsMode(): never {
      throw new GasPNotImplementedError('HtmlOutput', 'setXFrameOptionsMode');
    },
  };
  return output;
}

// createTemplateFromFile's evaluate() needs a live reference to the sandbox's
// own vm.Context to run <?= ?> scriptlet expressions against the script's own
// globals — unlike the rest of this shim, it can't be decoupled from the vm.
export function buildHtmlService(srcDir: string, context: vm.Context) {
  return {
    createTemplateFromFile(filename: string) {
      const raw = readFileSync(join(srcDir, `${filename}.html`), 'utf-8');
      return {
        evaluate(): HtmlOutput {
          return { getContent: () => evaluateTemplate(raw, context) };
        },
      };
    },
    createHtmlOutputFromFile(filename: string): HtmlOutput {
      const content = readFileSync(join(srcDir, `${filename}.html`), 'utf-8');
      return makeHtmlOutput(content);
    },
    createHtmlOutput(html = ''): HtmlOutput {
      return makeHtmlOutput(html);
    },
    createTemplate(): never {
      throw new GasPNotImplementedError('HtmlService', 'createTemplate');
    },
  };
}
