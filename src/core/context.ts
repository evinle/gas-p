import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

interface HtmlOutput {
  getContent(): string;
}

function isHtmlOutput(x: unknown): x is HtmlOutput {
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

function buildHtmlService(srcDir: string, context: vm.Context) {
  return {
    createTemplateFromFile(filename: string) {
      const raw = readFileSync(join(srcDir, `${filename}.html`), 'utf-8');
      return {
        evaluate(): HtmlOutput {
          return { getContent: () => evaluateTemplate(raw, context) };
        },
      };
    },
  };
}

// Builds a fresh vm context per call, matching Apps Script's per-execution
// model: no module-level state persists across separate buildContext calls.
export function buildContext(srcDir: string): vm.Context {
  const sandbox: Record<string, unknown> = {};
  vm.createContext(sandbox);
  sandbox.HtmlService = buildHtmlService(srcDir, sandbox);

  const sourceFiles = readdirSync(srcDir).filter((f) => extname(f) === '.gs' || extname(f) === '.js');
  for (const file of sourceFiles) {
    const contents = readFileSync(join(srcDir, file), 'utf-8');
    vm.runInContext(contents, sandbox, { filename: file });
  }

  return sandbox;
}

export { isHtmlOutput };
export type { HtmlOutput };
