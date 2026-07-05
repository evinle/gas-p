import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { build } from 'vite';
import type { InlineConfig } from 'vite';
import type { OutputChunk, RollupOutput } from 'rollup';
import { CalendarApp } from '../shims/CalendarApp.js';
import { Utilities } from '../shims/Utilities.js';
import { CacheService } from '../shims/CacheService.js';
import { Session } from '../shims/Session.js';
import { PropertiesService } from '../shims/PropertiesService.js';
import { HtmlService, isHtmlOutput, type HtmlOutput } from '../shims/HtmlService.js';
import { UrlFetchApp } from '../shims/UrlFetchApp.js';
import { Logger } from '../shims/Logger.js';

export interface ServiceOptions {
  credentialsPath: string;
  clientSecretPath: string;
  devResourceIds?: Record<string, string[]>;
}

export interface ConsumerViteConfig {
  resolve?: InlineConfig['resolve'];
  plugins?: InlineConfig['plugins'];
}

function createSandbox(srcDir: string, services?: ServiceOptions, htmlDir?: string): vm.Context {
  const sandbox: Record<string, unknown> = {};
  vm.createContext(sandbox);
  sandbox.HtmlService = new HtmlService(htmlDir ?? srcDir, sandbox);
  sandbox.Utilities = Utilities;
  sandbox.CacheService = CacheService;
  sandbox.PropertiesService = new PropertiesService(srcDir);
  sandbox.UrlFetchApp = UrlFetchApp;
  sandbox.Logger = Logger;
  if (services) {
    sandbox.CalendarApp = new CalendarApp(services.credentialsPath, services.clientSecretPath, services.devResourceIds);
    sandbox.Session = new Session(services.credentialsPath, services.clientSecretPath, srcDir);
  }
  return sandbox;
}

// Builds a fresh vm context per call, matching Apps Script's per-execution
// model: no module-level state persists across separate buildContext calls.
export function buildContext(srcDir: string, services?: ServiceOptions, htmlDir?: string): vm.Context {
  const sandbox = createSandbox(srcDir, services, htmlDir);

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
//
// consumerConfig carries the resolve options/plugins from the *consumer's own*
// already-resolved vite.config.ts (e.g. via server.config in configureServer),
// so this dev-time bundle resolves aliases/imports identically to their real
// `vite build` / `clasp push` artifact instead of a bare, config-less bundle.
export async function buildBundledContext(
  srcDir: string,
  entry: string,
  consumerConfig?: ConsumerViteConfig,
  services?: ServiceOptions,
  htmlDir?: string
): Promise<vm.Context> {
  const sandbox = createSandbox(srcDir, services, htmlDir);
  sandbox.module = { exports: {} };

  const result = await build({
    root: srcDir,
    configFile: false,
    logLevel: 'silent',
    resolve: consumerConfig?.resolve,
    plugins: consumerConfig?.plugins,
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
