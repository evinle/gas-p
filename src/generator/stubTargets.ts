import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { join } from 'path';
import type { StubTarget } from './runGenerator.js';

const SRC_ROOT = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function resolveTypesFile(specifier: string): string {
  return require.resolve(specifier);
}

export const stubTargets: StubTarget[] = [
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.cache.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
    outputName: 'CacheService',
    existingShimFile: join(SRC_ROOT, 'shims/CacheService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.cache.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Cache.Cache',
    outputName: 'Cache',
    existingShimFile: join(SRC_ROOT, 'shims/CacheService.ts'),
    implementationScope: 'scriptCache',
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.CalendarApp',
    outputName: 'CalendarApp',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
    outputFormat: 'class',
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Calendar',
    outputName: 'Calendar',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
    outputFormat: 'class',
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.CalendarEvent',
    outputName: 'CalendarEvent',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
    outputFormat: 'class',
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.utilities.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Utilities.Utilities',
    outputName: 'Utilities',
    existingShimFile: join(SRC_ROOT, 'shims/Utilities.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.properties.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Properties.PropertiesService',
    outputName: 'PropertiesService',
    existingShimFile: join(SRC_ROOT, 'shims/PropertiesService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.properties.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Properties.Properties',
    outputName: 'Properties',
    existingShimFile: join(SRC_ROOT, 'shims/PropertiesService.ts'),
    implementationScope: 'scriptProperties',
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.base.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Base.Session',
    outputName: 'Session',
    existingShimFile: join(SRC_ROOT, 'shims/Session.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.base.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Base.User',
    outputName: 'User',
    existingShimFile: join(SRC_ROOT, 'shims/Session.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.html.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.HTML.HtmlService',
    outputName: 'HtmlService',
    existingShimFile: join(SRC_ROOT, 'shims/HtmlService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.html.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.HTML.HtmlOutput',
    outputName: 'HtmlOutput',
    existingShimFile: join(SRC_ROOT, 'shims/HtmlService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.html.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.HTML.HtmlTemplate',
    outputName: 'HtmlTemplate',
    existingShimFile: join(SRC_ROOT, 'shims/HtmlService.ts'),
  },
];
