import { assertResourceAllowed } from '../core/allowlist.js';
import { runGoogleApiCall } from '../core/googleApiCall.js';
import { CalendarAppStubs } from './generated/CalendarApp.stubs.js';
import { CalendarStubs } from './generated/Calendar.stubs.js';
import { CalendarEventStubs } from './generated/CalendarEvent.stubs.js';

const SERVICE = 'CalendarApp';

interface RawEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

function isRawEvent(x: unknown): x is RawEvent {
  if (typeof x !== 'object' || x === null) return false;
  if (!('id' in x) || typeof x.id !== 'string') return false;
  if (!('summary' in x) || typeof x.summary !== 'string') return false;
  if (!('start' in x) || typeof x.start !== 'object' || x.start === null) return false;
  if (!('end' in x) || typeof x.end !== 'object' || x.end === null) return false;
  return true;
}

function createCalendarEvent(raw: RawEvent) {
  return {
    ...CalendarEventStubs,
    getTitle(): string {
      return raw.summary;
    },
    getSummary(): string {
      return raw.summary;
    },
    getStartTime(): Date {
      return new Date(raw.start.dateTime);
    },
    getEndTime(): Date {
      return new Date(raw.end.dateTime);
    },
  };
}

function createCalendar(calendarId: string, credentialsPath: string, clientSecretPath: string) {
  let eventsCache: RawEvent[] | null = null;

  function getEvents(startTime: Date, endTime: Date) {
    if (!eventsCache) {
      const { items } = runGoogleApiCall(credentialsPath, clientSecretPath, {
        service: 'calendar',
        version: 'v3',
        resource: 'events',
        method: 'list',
        params: {
          calendarId,
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: true,
        },
      });
      const raw = items ?? [];
      if (!raw.every(isRawEvent)) throw new Error('Unexpected events response shape');
      eventsCache = raw;
    }
    return eventsCache.map(createCalendarEvent);
  }

  function createEvent(title: string, startTime: Date, endTime: Date) {
    const raw = runGoogleApiCall(credentialsPath, clientSecretPath, {
      service: 'calendar',
      version: 'v3',
      resource: 'events',
      method: 'insert',
      params: {
        calendarId,
        requestBody: {
          summary: title,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        },
      },
    });
    if (!isRawEvent(raw)) throw new Error('Unexpected create event response shape');
    return createCalendarEvent(raw);
  }

  return {
    ...CalendarStubs,
    getEvents,
    createEvent,
  };
}

export function createCalendarApp(
  credentialsPath: string,
  clientSecretPath: string,
  devResourceIds: Record<string, string[]> | undefined
) {
  return {
    ...CalendarAppStubs,
    getCalendarById(id: string) {
      assertResourceAllowed(devResourceIds, SERVICE, id);
      return createCalendar(id, credentialsPath, clientSecretPath);
    },
    getDefaultCalendar() {
      assertResourceAllowed(devResourceIds, SERVICE, 'primary');
      return createCalendar('primary', credentialsPath, clientSecretPath);
    },
  };
}
