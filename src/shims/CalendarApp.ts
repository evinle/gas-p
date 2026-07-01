import { execFileSync } from 'child_process';
import { GasPNotImplementedError } from '../errors.js';

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

function buildFetchEventsScript(credentialsPath: string, calendarId: string, startTime: Date, endTime: Date): string {
  return `
import { google } from 'googleapis';
import { readFileSync } from 'fs';
const creds = JSON.parse(readFileSync(${JSON.stringify(credentialsPath)}, 'utf-8'));
const auth = new google.auth.OAuth2();
auth.setCredentials(creds);
const cal = google.calendar({ version: 'v3', auth });
const res = await cal.events.list({
  calendarId: ${JSON.stringify(calendarId)},
  timeMin: ${JSON.stringify(startTime.toISOString())},
  timeMax: ${JSON.stringify(endTime.toISOString())},
  singleEvents: true,
});
process.stdout.write(JSON.stringify(res.data.items ?? []));
`;
}

function buildCreateEventScript(credentialsPath: string, calendarId: string, title: string, startTime: Date, endTime: Date): string {
  return `
import { google } from 'googleapis';
import { readFileSync } from 'fs';
const creds = JSON.parse(readFileSync(${JSON.stringify(credentialsPath)}, 'utf-8'));
const auth = new google.auth.OAuth2();
auth.setCredentials(creds);
const cal = google.calendar({ version: 'v3', auth });
const res = await cal.events.insert({
  calendarId: ${JSON.stringify(calendarId)},
  requestBody: {
    summary: ${JSON.stringify(title)},
    start: { dateTime: ${JSON.stringify(startTime.toISOString())} },
    end: { dateTime: ${JSON.stringify(endTime.toISOString())} },
  },
});
process.stdout.write(JSON.stringify(res.data));
`;
}

function execScript(script: string): unknown {
  const output = execFileSync(process.execPath, ['--input-type=module'], {
    input: script,
    encoding: 'utf-8',
  });
  return JSON.parse(output);
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

  constructor(private calendarId: string, private credentialsPath: string) {}

  getEvents(startTime: Date, endTime: Date): CalendarEvent[] {
    if (!this.eventsCache) {
      const raw = execScript(buildFetchEventsScript(this.credentialsPath, this.calendarId, startTime, endTime));
      if (!Array.isArray(raw) || !raw.every(isRawEvent)) throw new Error('Unexpected events response shape');
      this.eventsCache = raw;
    }
    return this.eventsCache.map((e) => new CalendarEvent(e));
  }

  createEvent(title: string, startTime: Date, endTime: Date): CalendarEvent {
    const raw = execScript(buildCreateEventScript(this.credentialsPath, this.calendarId, title, startTime, endTime));
    if (!isRawEvent(raw)) throw new Error('Unexpected create event response shape');
    return new CalendarEvent(raw);
  }
}

export function createCalendarApp(credentialsPath: string) {
  return {
    getCalendarById(id: string): Calendar {
      return new Calendar(id, credentialsPath);
    },
    getDefaultCalendar(): Calendar {
      return new Calendar('primary', credentialsPath);
    },
    getCalendarsByName(_name: string): never {
      throw new GasPNotImplementedError('CalendarApp', 'getCalendarsByName');
    },
    getOwnedCalendars(): never {
      throw new GasPNotImplementedError('CalendarApp', 'getOwnedCalendars');
    },
  };
}
