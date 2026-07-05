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
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.CalendarApp',
    outputName: 'CalendarApp',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Calendar',
    outputName: 'Calendar',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.calendar.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.CalendarEvent',
    outputName: 'CalendarEvent',
    existingShimFile: join(SRC_ROOT, 'shims/CalendarApp.ts'),
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
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.forms.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Forms.FormApp',
    outputName: 'FormApp',
    existingShimFile: join(SRC_ROOT, 'shims/FormApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.sites.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sites.SitesApp',
    outputName: 'SitesApp',
    existingShimFile: join(SRC_ROOT, 'shims/SitesApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.gmail.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Gmail.GmailApp',
    outputName: 'GmailApp',
    existingShimFile: join(SRC_ROOT, 'shims/GmailApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.groups.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Groups.GroupsApp',
    outputName: 'GroupsApp',
    existingShimFile: join(SRC_ROOT, 'shims/GroupsApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.jdbc.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.JDBC.Jdbc',
    outputName: 'Jdbc',
    existingShimFile: join(SRC_ROOT, 'shims/Jdbc.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.language.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Language.LanguageApp',
    outputName: 'LanguageApp',
    existingShimFile: join(SRC_ROOT, 'shims/LanguageApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.lock.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Lock.LockService',
    outputName: 'LockService',
    existingShimFile: join(SRC_ROOT, 'shims/LockService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.drive.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive.DriveApp',
    outputName: 'DriveApp',
    existingShimFile: join(SRC_ROOT, 'shims/DriveApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.script.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Script.ScriptApp',
    outputName: 'ScriptApp',
    existingShimFile: join(SRC_ROOT, 'shims/ScriptApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.contacts.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Contacts.ContactsApp',
    outputName: 'ContactsApp',
    existingShimFile: join(SRC_ROOT, 'shims/ContactsApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.mail.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Mail.MailApp',
    outputName: 'MailApp',
    existingShimFile: join(SRC_ROOT, 'shims/MailApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.conference-data.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Conference_Data.ConferenceDataService',
    outputName: 'ConferenceDataService',
    existingShimFile: join(SRC_ROOT, 'shims/ConferenceDataService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.xml-service.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.XML_Service.XmlService',
    outputName: 'XmlService',
    existingShimFile: join(SRC_ROOT, 'shims/XmlService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.document.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Document.DocumentApp',
    outputName: 'DocumentApp',
    existingShimFile: join(SRC_ROOT, 'shims/DocumentApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.base.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Base.Browser',
    outputName: 'Browser',
    existingShimFile: join(SRC_ROOT, 'shims/Browser.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.data-studio.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Data_Studio.DataStudioApp',
    outputName: 'DataStudioApp',
    existingShimFile: join(SRC_ROOT, 'shims/DataStudioApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.slides.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Slides.SlidesApp',
    outputName: 'SlidesApp',
    existingShimFile: join(SRC_ROOT, 'shims/SlidesApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.card-service.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Card_Service.CardService',
    outputName: 'CardService',
    existingShimFile: join(SRC_ROOT, 'shims/CardService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.spreadsheet.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Spreadsheet.SpreadsheetApp',
    outputName: 'SpreadsheetApp',
    existingShimFile: join(SRC_ROOT, 'shims/SpreadsheetApp.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.content.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Content.ContentService',
    outputName: 'ContentService',
    existingShimFile: join(SRC_ROOT, 'shims/ContentService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.charts.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Charts.Charts',
    outputName: 'Charts',
    existingShimFile: join(SRC_ROOT, 'shims/Charts.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.maps.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Maps.Maps',
    outputName: 'Maps',
    existingShimFile: join(SRC_ROOT, 'shims/Maps.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.optimization.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Optimization.LinearOptimizationService',
    outputName: 'LinearOptimizationService',
    existingShimFile: join(SRC_ROOT, 'shims/LinearOptimizationService.ts'),
  },
];
