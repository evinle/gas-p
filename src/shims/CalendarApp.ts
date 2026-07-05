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

class CalendarEvent extends CalendarEventStubs {
  constructor(private raw: RawEvent) {
    super();
  }

  getTitle(): string {
    return this.raw.summary;
  }

  getSummary(): string {
    return this.raw.summary;
  }

  getStartTime(): Date {
    return new Date(this.raw.start.dateTime);
  }

  getEndTime(): Date {
    return new Date(this.raw.end.dateTime);
  }
}

class Calendar extends CalendarStubs {
  private eventsCache: RawEvent[] | null = null;

  constructor(
    private calendarId: string,
    private credentialsPath: string,
    private clientSecretPath: string
  ) {
    super();
  }

  getEvents(startTime: Date, endTime: Date) {
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
    return this.eventsCache.map((raw) => new CalendarEvent(raw));
  }

  createEvent(title: string, startTime: Date, endTime: Date) {
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

export class CalendarApp extends CalendarAppStubs {
  constructor(
    private credentialsPath: string,
    private clientSecretPath: string,
    private devResourceIds: Record<string, string[]> | undefined
  ) {
    super();
  }

  getCalendarById(id: string) {
    assertResourceAllowed(this.devResourceIds, SERVICE, id);
    return new Calendar(id, this.credentialsPath, this.clientSecretPath);
  }

  getDefaultCalendar() {
    assertResourceAllowed(this.devResourceIds, SERVICE, 'primary');
    return new Calendar('primary', this.credentialsPath, this.clientSecretPath);
  }
}
