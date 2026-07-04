import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { build } from 'vite';
import type { OutputChunk, RollupOutput } from 'rollup';

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

function createSandbox(srcDir: string): vm.Context {
  const sandbox: Record<string, unknown> = {};
  vm.createContext(sandbox);
  sandbox.HtmlService = buildHtmlService(srcDir, sandbox);
  return sandbox;
}

// Builds a fresh vm context per call, matching Apps Script's per-execution
// model: no module-level state persists across separate buildContext calls.
export function buildContext(srcDir: string): vm.Context {
  const sandbox = createSandbox(srcDir);

  const sourceFiles = readdirSync(srcDir).filter((f) => extname(f) === '.gs' || extname(f) === '.js');
  if (sourceFiles.length === 0) {
    throw new Error(`No .gs/.js source found in ${srcDir} — for a .ts project, use buildBundledContext(srcDir, entry) instead.`);
  }
  for (const file of sourceFiles) {
    const contents = readFileSync(join(srcDir, file), 'utf-8');
    vm.runInContext(contents, sandbox, { filename: file });
  }

  return sandbox;
}

// Bundles `entry` (a .ts file with real imports) via Vite's build({ write: false })
// API, then executes the result in the same isolated vm sandbox buildContext uses
// for raw .gs/.js — same isolation/ReferenceError behavior either way.
export async function buildBundledContext(srcDir: string, entry: string): Promise<vm.Context> {
  const sandbox = createSandbox(srcDir);
  sandbox.module = { exports: {} };

  const result = await build({
    root: srcDir,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      outDir: 'dist-gas-p-bundle',
      rollupOptions: {
        input: join(srcDir, entry),
        output: { format: 'cjs', entryFileNames: 'bundle.js' },
        treeshake: false,
      },
    },
  });

  if ('close' in result) {
    throw new Error('Unexpected watch-mode build result while bundling for the vm sandbox');
  }
  const rollupOutputs: RollupOutput[] = Array.isArray(result) ? result : [result];
  const output = rollupOutputs[0]!.output;
  const entryChunk: OutputChunk | undefined = output.find(
    (chunk): chunk is OutputChunk => chunk.type === 'chunk' && chunk.isEntry
  );
  if (!entryChunk) {
    throw new Error(`Vite produced no entry chunk for ${entry}`);
  }

  vm.runInContext(entryChunk.code, sandbox, { filename: entry });

  return sandbox;
}

export { isHtmlOutput };
export type { HtmlOutput };
