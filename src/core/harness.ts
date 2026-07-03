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

const HOST_ERROR_CONSTRUCTORS: Record<string, ErrorConstructor> = {
  ReferenceError,
  TypeError,
  RangeError,
  SyntaxError,
  EvalError,
  URIError,
};

function isErrorLike(x: unknown): x is { name: string; message: string } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('name' in x) || typeof x.name !== 'string') return false;
  if (!('message' in x) || typeof x.message !== 'string') return false;
  return true;
}

// Errors thrown inside the vm context are instances of *that context's own*
// Error constructors, not the host realm's — instanceof checks against them
// (e.g. `instanceof ReferenceError`) fail even for a genuine ReferenceError.
// Re-throw as a host-realm error of the same name so callers can rely on
// instanceof, matching real Apps Script's ReferenceError failure mode.
function rethrowInHostRealm(error: unknown): never {
  if (isErrorLike(error)) {
    const HostErrorConstructor = HOST_ERROR_CONSTRUCTORS[error.name] ?? Error;
    throw new HostErrorConstructor(error.message);
  }
  throw error;
}

export function renderDoGet(srcDir: string): string {
  try {
    const sandbox: Record<string, unknown> = {};
    vm.createContext(sandbox);
    sandbox.HtmlService = buildHtmlService(srcDir, sandbox);

    const sourceFiles = readdirSync(srcDir).filter((f) => extname(f) === '.gs' || extname(f) === '.js');
    for (const file of sourceFiles) {
      const contents = readFileSync(join(srcDir, file), 'utf-8');
      vm.runInContext(contents, sandbox, { filename: file });
    }

    const doGet = sandbox.doGet;
    if (typeof doGet !== 'function') {
      throw new Error(`doGet is not defined in ${srcDir}`);
    }

    const result: unknown = doGet();
    if (!isHtmlOutput(result)) {
      throw new Error('doGet() did not return an HtmlOutput');
    }
    return result.getContent();
  } catch (error) {
    rethrowInHostRealm(error);
  }
}
