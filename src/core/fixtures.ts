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
import type { Calendar } from '../shims/Calendar.js';
import type { People } from '../shims/People.js';
import type { Docs } from '../shims/Docs.js';
import type { Tasks } from '../shims/Tasks.js';
import type { Sheets } from '../shims/Sheets.js';
import type { BigQuery } from '../shims/BigQuery.js';
import type { Drive } from '../shims/Drive.js';

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
  Calendar: typeof Calendar;
  People: typeof People;
  Docs: typeof Docs;
  Tasks: typeof Tasks;
  Sheets: typeof Sheets;
  BigQuery: typeof BigQuery;
  Drive: typeof Drive;
}

// True only for T = never — boxed in a tuple so the check doesn't hit
// conditional types' own never-short-circuit rule (a naked `T extends X`
// resolves straight to `never` when T is instantiated with never, before X
// is ever consulted, which is exactly the case DeepPartialFixture needs to
// detect rather than skip).
type IsNever<T> = [T] extends [never] ? true : false;

// A fixture only needs to answer the calls a consumer actually declares, not
// implement a real Calendar/CalendarEvent/etc. interface in full — so every
// method a real return type declares is made optional, recursively, instead
// of requiring the whole shape. Methods still get real, non-`any` parameter
// types from the actual GAS interface (autocomplete included); only their
// declared-but-unimplemented depth is what's optional. Stub-only methods
// (generated *.stubs.ts classes type every method as
// `(...args: unknown[]) => never`) have no usable return type to recurse
// into, so they fall back to `unknown`, same as a fixture's own top-level
// value (see MethodFixtureValue below).
type DeepPartialFixture<T> = IsNever<T> extends true
  ? unknown
  : T extends (...args: infer A) => infer R
    ? (...args: A) => DeepPartialFixture<R>
    : T extends Date
      ? T
      : T extends readonly (infer U)[]
        ? DeepPartialFixture<U>[]
        : T extends object
          ? { [K in keyof T]?: DeepPartialFixture<T[K]> }
          : T;

// Method-shaped members get a fixture value/answering function, same as
// always. Object-shaped members (a composed service's sub-collections, e.g.
// Calendar.Events or People.ContactGroups.Members — #45/#46) recurse into
// their own TypedServiceFixtures instead of falling back to `never`, so
// nested Declared Fixtures type-check to whatever depth a composed service's
// shim actually nests, matching applyFixtures' runtime NestedFixtureKeys
// recursion without needing its own hand-maintained depth here.
type TypedServiceFixtures<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer R
    ? DeepPartialFixture<R> | ((...args: A) => DeepPartialFixture<R>)
    : T[K] extends object
      ? TypedServiceFixtures<T[K]>
      : never;
};

export type GasPFixtures = Partial<{
  [K in keyof EligibleServiceInstances]: TypedServiceFixtures<EligibleServiceInstances[K]>;
}>;

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

// Exported for context.ts's sandbox-global lookups too — vm.Context indexing
// resolves to `any`, so this is how callers narrow to `object` (applyFixtures'
// own constraint) without an `as` assertion.
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Looks up one service's (or, for a composed service like Calendar, one of
// its sub-collections') Declared Fixtures out of the loosely-shaped runtime
// fixtures tree, without asserting GasPFixtures's strict, name-checked shape
// onto it — Reflect.get sidesteps the missing index signature instead.
function lookupFixtures(fixtures: object, key: string): Record<string, unknown> | undefined {
  const value: unknown = Reflect.get(fixtures, key);
  return isRecord(value) ? value : undefined;
}

// Describes a composed service's sub-collection tree for nested fixture
// wrapping — e.g. Calendar's is flat ({ Events: {}, Acl: {}, ... }), while
// People's ContactGroups/People collections each nest one further collection
// of their own ({ ContactGroups: { Members: {} }, People: { Connections: {} },
// OtherContacts: {} }), so this recurses to whatever depth a service needs.
export interface NestedFixtureKeys {
  readonly [key: string]: NestedFixtureKeys;
}

// Wraps a service singleton so a matching Declared Fixture answers a method
// call instead of the real implementation — only intercepts the object's own
// top-level method names, not anything a call happens to return, with one
// exception: nestedFixtureKeys (for a composed service like Calendar, #45 —
// Calendar.Events, Calendar.Acl, ...) get their own nested wrapping, applied
// lazily on each property access rather than by mutating the target, since
// composed services (like flat ones) are shared, module-level singletons —
// mutating instance.Events directly would leak one build's fixtures into
// every other buildContext call sharing the same underlying instance.
function wrapWithFixtures<T extends object>(
  instance: T,
  methodFixtures: Record<string, unknown> | undefined,
  nestedFixtureKeys: NestedFixtureKeys
): T {
  if (!methodFixtures && Object.keys(nestedFixtureKeys).length === 0) return instance;

  return new Proxy(instance, {
    get(target, prop, receiver) {
      const value: unknown = Reflect.get(target, prop, receiver);
      if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(nestedFixtureKeys, prop)) {
        if (!isRecord(value)) {
          throw new Error(`Expected composed property '${prop}' to be an object, got ${typeof value}`);
        }
        return wrapWithFixtures(value, methodFixtures && lookupFixtures(methodFixtures, prop), nestedFixtureKeys[prop] ?? {});
      }
      if (typeof prop === 'string' && methodFixtures && Object.prototype.hasOwnProperty.call(methodFixtures, prop)) {
        const fixture = methodFixtures[prop];
        return (...args: unknown[]) => (typeof fixture === 'function' ? fixture(...args) : fixture);
      }
      return value;
    },
  });
}

// Public entry point — GasPFixtures's strict, name-checked keys exist for
// consumers authoring gas-p.fixtures.ts, so this is the only place that
// indexes it by a plain runtime string (the service name being wrapped).
export function applyFixtures<T extends object>(
  serviceName: string,
  instance: T,
  fixtures: GasPFixtures,
  nestedFixtureKeys: NestedFixtureKeys = {}
): T {
  return wrapWithFixtures(instance, lookupFixtures(fixtures, serviceName), nestedFixtureKeys);
}
