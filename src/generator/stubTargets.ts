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
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.base.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Base.Blob',
    outputName: 'Blob',
    existingShimFile: join(SRC_ROOT, 'shims/Blob.ts'),
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
  // Advanced Calendar service (#45) — distinct from the basic CalendarApp
  // targets above (different .d.ts file, different global). outputName is
  // 'AdvancedCalendar', not 'Calendar', since CalendarApp.ts already owns the
  // generated output name 'Calendar' for its own per-event Calendar object.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar',
    outputName: 'AdvancedCalendar',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.EventsCollection',
    outputName: 'CalendarEvents',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.AclCollection',
    outputName: 'CalendarAcl',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.CalendarListCollection',
    outputName: 'CalendarCalendarList',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.CalendarsCollection',
    outputName: 'CalendarCalendars',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.ChannelsCollection',
    outputName: 'CalendarChannels',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.ColorsCollection',
    outputName: 'CalendarColors',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.FreebusyCollection',
    outputName: 'CalendarFreebusy',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/calendar_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Calendar.Collection.SettingsCollection',
    outputName: 'CalendarSettings',
    existingShimFile: join(SRC_ROOT, 'shims/Calendar.ts'),
  },
  // Advanced People service (#45) — like Calendar, ContactGroups and People
  // each nest one further collection of their own (ContactGroups.Members,
  // People.Connections), so this isn't a flat Root -> Collection composition;
  // shims/People.ts composes two levels.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People',
    outputName: 'AdvancedPeople',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People.Collection.ContactGroupsCollection',
    outputName: 'PeopleContactGroups',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People.Collection.ContactGroups.MembersCollection',
    outputName: 'PeopleContactGroupsMembers',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People.Collection.OtherContactsCollection',
    outputName: 'PeopleOtherContacts',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People.Collection.PeopleCollection',
    outputName: 'PeoplePeople',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/peopleapi_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.People.Collection.People.ConnectionsCollection',
    outputName: 'PeoplePeopleConnections',
    existingShimFile: join(SRC_ROOT, 'shims/People.ts'),
  },
  // Advanced Docs service — flat, single collection.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/docs_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Docs',
    outputName: 'Docs',
    existingShimFile: join(SRC_ROOT, 'shims/Docs.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/docs_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Docs.Collection.DocumentsCollection',
    outputName: 'DocsDocuments',
    existingShimFile: join(SRC_ROOT, 'shims/Docs.ts'),
  },
  // Advanced Tasks service — flat, two collections.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/tasks_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Tasks',
    outputName: 'Tasks',
    existingShimFile: join(SRC_ROOT, 'shims/Tasks.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/tasks_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Tasks.Collection.TasklistsCollection',
    outputName: 'TasksTasklists',
    existingShimFile: join(SRC_ROOT, 'shims/Tasks.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/tasks_v1.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Tasks.Collection.TasksCollection',
    outputName: 'TasksTasks',
    existingShimFile: join(SRC_ROOT, 'shims/Tasks.ts'),
  },
  // Advanced Sheets service — Spreadsheets nests DeveloperMetadata/Sheets/
  // Values one further level, like People's ContactGroups/People.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/sheets_v4.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sheets',
    outputName: 'Sheets',
    existingShimFile: join(SRC_ROOT, 'shims/Sheets.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/sheets_v4.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sheets.Collection.SpreadsheetsCollection',
    outputName: 'SheetsSpreadsheets',
    existingShimFile: join(SRC_ROOT, 'shims/Sheets.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/sheets_v4.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sheets.Collection.Spreadsheets.DeveloperMetadataCollection',
    outputName: 'SheetsSpreadsheetsDeveloperMetadata',
    existingShimFile: join(SRC_ROOT, 'shims/Sheets.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/sheets_v4.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sheets.Collection.Spreadsheets.SheetsCollection',
    outputName: 'SheetsSpreadsheetsSheets',
    existingShimFile: join(SRC_ROOT, 'shims/Sheets.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/sheets_v4.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Sheets.Collection.Spreadsheets.ValuesCollection',
    outputName: 'SheetsSpreadsheetsValues',
    existingShimFile: join(SRC_ROOT, 'shims/Sheets.ts'),
  },
  // Advanced BigQuery service — flat, five collections.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery',
    outputName: 'BigQuery',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery.Collection.DatasetsCollection',
    outputName: 'BigQueryDatasets',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery.Collection.JobsCollection',
    outputName: 'BigQueryJobs',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery.Collection.ProjectsCollection',
    outputName: 'BigQueryProjects',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery.Collection.TabledataCollection',
    outputName: 'BigQueryTabledata',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/bigquery_v2.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.BigQuery.Collection.TablesCollection',
    outputName: 'BigQueryTables',
    existingShimFile: join(SRC_ROOT, 'shims/BigQuery.ts'),
  },
  // Advanced Drive service — flat, thirteen collections. Its collection
  // interfaces live under a different namespace path (Drive_v3.Drive.V3.
  // Collection.*) than the root (GoogleAppsScript.Drive) — a quirk of how
  // @types/google-apps-script models this one service, not something gas-p
  // chose.
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive',
    outputName: 'Drive',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.AboutCollection',
    outputName: 'DriveAbout',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.AppsCollection',
    outputName: 'DriveApps',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.ChangesCollection',
    outputName: 'DriveChanges',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.ChannelsCollection',
    outputName: 'DriveChannels',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.CommentsCollection',
    outputName: 'DriveComments',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.DrivesCollection',
    outputName: 'DriveDrives',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.FilesCollection',
    outputName: 'DriveFiles',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.OperationCollection',
    outputName: 'DriveOperation',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.OperationsCollection',
    outputName: 'DriveOperations',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.PermissionsCollection',
    outputName: 'DrivePermissions',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.RepliesCollection',
    outputName: 'DriveReplies',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.RevisionsCollection',
    outputName: 'DriveRevisions',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/apis/drive_v3.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Drive_v3.Drive.V3.Collection.TeamdrivesCollection',
    outputName: 'DriveTeamdrives',
    existingShimFile: join(SRC_ROOT, 'shims/Drive.ts'),
  },
];
