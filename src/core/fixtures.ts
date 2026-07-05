import { existsSync } from 'node:fs';
import { loadConfigFromFile } from 'vite';
import type { SpreadsheetApp } from '../shims/SpreadsheetApp.js';
import type { FormApp } from '../shims/FormApp.js';
import type { GmailApp } from '../shims/GmailApp.js';
import type { DriveApp } from '../shims/DriveApp.js';
import type { GroupsApp } from '../shims/GroupsApp.js';
import type { Jdbc } from '../shims/Jdbc.js';
import type { LanguageApp } from '../shims/LanguageApp.js';
import type { ScriptApp } from '../shims/ScriptApp.js';
import type { ContactsApp } from '../shims/ContactsApp.js';
import type { MailApp } from '../shims/MailApp.js';
import type { ConferenceDataService } from '../shims/ConferenceDataService.js';
import type { XmlService } from '../shims/XmlService.js';
import type { DocumentApp } from '../shims/DocumentApp.js';
import type { Browser } from '../shims/Browser.js';
import type { DataStudioApp } from '../shims/DataStudioApp.js';
import type { SlidesApp } from '../shims/SlidesApp.js';
import type { CardService } from '../shims/CardService.js';
import type { ContentService } from '../shims/ContentService.js';
import type { Charts } from '../shims/Charts.js';
import type { Maps } from '../shims/Maps.js';
import type { LinearOptimizationService } from '../shims/LinearOptimizationService.js';
import type { CalendarApp } from '../shims/CalendarApp.js';
import type { Session } from '../shims/Session.js';

// The STATIC_SERVICES entries eligible for Declared Fixtures (context.ts's
// FIXTURE_EXCLUDED_STATIC_SERVICES excludes Utilities/CacheService/
// UrlFetchApp/Logger), plus CalendarApp/Session (fixtureEligible in
// CONFIGURED_SERVICES). Kept in sync with those lists by hand — this is a
// type import for name/method-checking gas-p.fixtures.ts only, not a runtime
// source of truth.
interface EligibleServiceInstances {
  SpreadsheetApp: typeof SpreadsheetApp;
  CalendarApp: InstanceType<typeof CalendarApp>;
  Session: InstanceType<typeof Session>;
  FormApp: typeof FormApp;
  GmailApp: typeof GmailApp;
  DriveApp: typeof DriveApp;
  GroupsApp: typeof GroupsApp;
  Jdbc: typeof Jdbc;
  LanguageApp: typeof LanguageApp;
  ScriptApp: typeof ScriptApp;
  ContactsApp: typeof ContactsApp;
  MailApp: typeof MailApp;
  ConferenceDataService: typeof ConferenceDataService;
  XmlService: typeof XmlService;
  DocumentApp: typeof DocumentApp;
  Browser: typeof Browser;
  DataStudioApp: typeof DataStudioApp;
  SlidesApp: typeof SlidesApp;
  CardService: typeof CardService;
  ContentService: typeof ContentService;
  Charts: typeof Charts;
  Maps: typeof Maps;
  LinearOptimizationService: typeof LinearOptimizationService;
}

// Every stub method today is typed (...args: unknown[]) => never (see the
// generated *.stubs.ts classes), so a real method's return type can't be
// usefully required of a fixture's value — we only get real mileage out of
// checking the method *name* and its argument list, and relax the fixture's
// own value/return type to unknown.
type MethodFixtureValue<M> = M extends (...args: infer A) => unknown ? unknown | ((...args: A) => unknown) : never;

type TypedServiceFixtures<T> = { [K in keyof T]?: MethodFixtureValue<T[K]> };

export type GasPFixtures = Partial<{
  [K in keyof EligibleServiceInstances]: TypedServiceFixtures<EligibleServiceInstances[K]>;
}>;

// Loose runtime shape used internally — GasPFixtures's strict, name-checked
// keys exist for consumers authoring gas-p.fixtures.ts, but applyFixtures/
// loadFixtures index by a plain runtime string (the service name being
// wrapped, or whatever loadConfigFromFile handed back), not a literal key.
type LooseGasPFixtures = Record<string, Record<string, unknown>>;

// Identity helper mirroring defineGasPConfig — no runtime behavior, just IDE
// type-hinting for a hand-authored gas-p.fixtures.ts.
export function defineGasPFixtures(fixtures: GasPFixtures): GasPFixtures {
  return fixtures;
}

function isGasPFixtures(x: unknown): x is GasPFixtures {
  return typeof x === 'object' && x !== null;
}

// Reads gas-p.fixtures.ts fresh from disk on every call — unlike
// loadGasPConfig, never cached across calls (see ADR 0009). fixturesFile is
// optional and may point at a nonexistent path: both cases mean "no fixtures
// declared," not an error, since gas-p.fixtures.ts itself is optional.
export async function loadFixtures(fixturesFile: string | undefined): Promise<GasPFixtures> {
  if (!fixturesFile || !existsSync(fixturesFile)) return {};

  const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, fixturesFile);
  if (!loaded || !isGasPFixtures(loaded.config)) return {};
  return loaded.config;
}

// Wraps a service singleton so a matching Declared Fixture answers a method
// call instead of the real implementation — only intercepts the object's own
// top-level method names, not anything a call happens to return.
export function applyFixtures<T extends object>(serviceName: string, instance: T, fixtures: GasPFixtures): T {
  const methodFixtures = (fixtures as LooseGasPFixtures)[serviceName];
  if (!methodFixtures) return instance;

  return new Proxy(instance, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(methodFixtures, prop)) {
        const fixture = methodFixtures[prop];
        return (...args: unknown[]) => (typeof fixture === 'function' ? fixture(...args) : fixture);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
