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
import { FormApp } from '../shims/FormApp.js';
import { SitesApp } from '../shims/SitesApp.js';
import { GmailApp } from '../shims/GmailApp.js';
import { GroupsApp } from '../shims/GroupsApp.js';
import { Jdbc } from '../shims/Jdbc.js';
import { LanguageApp } from '../shims/LanguageApp.js';
import { LockService } from '../shims/LockService.js';
import { DriveApp } from '../shims/DriveApp.js';
import { ScriptApp } from '../shims/ScriptApp.js';
import { ContactsApp } from '../shims/ContactsApp.js';
import { MailApp } from '../shims/MailApp.js';
import { ConferenceDataService } from '../shims/ConferenceDataService.js';
import { XmlService } from '../shims/XmlService.js';
import { DocumentApp } from '../shims/DocumentApp.js';
import { Browser } from '../shims/Browser.js';
import { DataStudioApp } from '../shims/DataStudioApp.js';
import { SlidesApp } from '../shims/SlidesApp.js';
import { CardService } from '../shims/CardService.js';
import { SpreadsheetApp } from '../shims/SpreadsheetApp.js';
import { ContentService } from '../shims/ContentService.js';
import { Charts } from '../shims/Charts.js';
import { Maps } from '../shims/Maps.js';
import { LinearOptimizationService } from '../shims/LinearOptimizationService.js';

// Already-instantiated singletons with no per-request construction — safe to
// assign onto every sandbox unconditionally. Real implementations (Utilities,
// CacheService, UrlFetchApp, Logger) and not-yet-implemented stub-only
// services (everything else here) both fit this shape today; a stub-only
// entry moves out of this object and into CONFIGURED_SERVICES below only if
// its real implementation later needs config the shim module can't see on
// its own (credentials, srcDir, ...).
const STATIC_SERVICES: Record<string, unknown> = {
  Utilities,
  CacheService,
  UrlFetchApp,
  Logger,
  FormApp,
  SitesApp,
  GmailApp,
  GroupsApp,
  Jdbc,
  LanguageApp,
  LockService,
  DriveApp,
  ScriptApp,
  ContactsApp,
  MailApp,
  ConferenceDataService,
  XmlService,
  DocumentApp,
  Browser,
  DataStudioApp,
  SlidesApp,
  CardService,
  SpreadsheetApp,
  ContentService,
  Charts,
  Maps,
  LinearOptimizationService,
};

interface SandboxBuildParams {
  srcDir: string;
  htmlDir?: string;
  sandbox: vm.Context;
  services?: ServiceOptions;
}

interface ConfiguredService {
  name: string;
  // Whether this service needs credentials (services option) to construct —
  // CalendarApp/Session touch real Google APIs and are only reachable when
  // the harness was given credentials to do so.
  requiresServices: boolean;
  create(params: SandboxBuildParams): unknown;
}

const CONFIGURED_SERVICES: ConfiguredService[] = [
  {
    name: 'HtmlService',
    requiresServices: false,
    create: ({ srcDir, htmlDir, sandbox }) => new HtmlService(htmlDir ?? srcDir, sandbox),
  },
  {
    name: 'PropertiesService',
    requiresServices: false,
    create: ({ srcDir }) => new PropertiesService(srcDir),
  },
  {
    name: 'CalendarApp',
    requiresServices: true,
    create: ({ services }) => {
      if (!services) throw new Error('CalendarApp requires services to be configured');
      return new CalendarApp(services.credentialsPath, services.clientSecretPath, services.devResourceIds);
    },
  },
  {
    name: 'Session',
    requiresServices: true,
    create: ({ srcDir, services }) => {
      if (!services) throw new Error('Session requires services to be configured');
      return new Session(services.credentialsPath, services.clientSecretPath, srcDir);
    },
  },
];

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

  Object.assign(sandbox, STATIC_SERVICES);

  const params: SandboxBuildParams = { srcDir, htmlDir, sandbox, services };
  for (const configured of CONFIGURED_SERVICES) {
    if (configured.requiresServices && !services) continue;
    sandbox[configured.name] = configured.create(params);
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
