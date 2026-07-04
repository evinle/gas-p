import { GasPNotImplementedError } from '../errors.js';
import { assertResourceAllowed } from '../core/allowlist.js';
import { runGoogleApiCall } from '../core/googleApiCall.js';

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

export interface IGasCalendarEvent {
  getTitle(): string;
  getSummary(): string;
  getStartTime(): Date;
  getEndTime(): Date;
}

export interface IGasCalendar {
  getEvents(startTime: Date, endTime: Date): IGasCalendarEvent[];
  createEvent(title: string, startTime: Date, endTime: Date): IGasCalendarEvent;
}

class CalendarEvent implements IGasCalendarEvent {
  constructor(private raw: RawEvent) {}
  getTitle(): string { return this.raw.summary; }
  getSummary(): string { return this.raw.summary; }
  getStartTime(): Date { return new Date(this.raw.start.dateTime); }
  getEndTime(): Date { return new Date(this.raw.end.dateTime); }
}

class Calendar implements IGasCalendar {
  private eventsCache: RawEvent[] | null = null;

  constructor(private calendarId: string, private credentialsPath: string, private clientSecretPath: string) {}

  getEvents(startTime: Date, endTime: Date): CalendarEvent[] {
    if (!this.eventsCache) {
      const { items } = runGoogleApiCall(this.credentialsPath, this.clientSecretPath, {
        service: 'calendar',
        version: 'v3',
        resource: 'events',
        method: 'list',
        params: {
          calendarId: this.calendarId,
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: true,
        },
      });
      const raw = items ?? [];
      if (!raw.every(isRawEvent)) throw new Error('Unexpected events response shape');
      this.eventsCache = raw;
    }
    return this.eventsCache.map((e) => new CalendarEvent(e));
  }

  createEvent(title: string, startTime: Date, endTime: Date): CalendarEvent {
    const raw = runGoogleApiCall(this.credentialsPath, this.clientSecretPath, {
      service: 'calendar',
      version: 'v3',
      resource: 'events',
      method: 'insert',
      params: {
        calendarId: this.calendarId,
        requestBody: {
          summary: title,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        },
      },
    });
    if (!isRawEvent(raw)) throw new Error('Unexpected create event response shape');
    return new CalendarEvent(raw);
  }
}

export function createCalendarApp(
  credentialsPath: string,
  clientSecretPath: string,
  devResourceIds: Record<string, string[]> | undefined
) {
  return {
    getCalendarById(id: string): Calendar {
      assertResourceAllowed(devResourceIds, SERVICE, id);
      return new Calendar(id, credentialsPath, clientSecretPath);
    },
    getDefaultCalendar(): Calendar {
      assertResourceAllowed(devResourceIds, SERVICE, 'primary');
      return new Calendar('primary', credentialsPath, clientSecretPath);
    },
    getCalendarsByName(_name: string): never {
      throw new GasPNotImplementedError('CalendarApp', 'getCalendarsByName');
    },
    getOwnedCalendars(): never {
      throw new GasPNotImplementedError('CalendarApp', 'getOwnedCalendars');
    },
  };
}
