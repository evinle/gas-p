import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';
import { GasPMissingCredentialsError } from '../errors.js';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

const START = new Date('2026-07-01T09:00:00Z');
const END = new Date('2026-07-01T17:00:00Z');

const RAW_EVENT = {
  id: 'evt1',
  summary: 'Team Standup',
  start: { dateTime: '2026-07-01T10:00:00Z' },
  end: { dateTime: '2026-07-01T10:30:00Z' },
};

const RAW_CREATED_EVENT = {
  id: 'evt2',
  summary: 'New Meeting',
  start: { dateTime: '2026-07-01T14:00:00Z' },
  end: { dateTime: '2026-07-01T15:00:00Z' },
};

const ALLOWLIST = { CalendarApp: ['cal123', 'primary'] };

beforeEach(() => { vi.resetAllMocks(); });

describe('CalendarApp.getCalendarById()', () => {
  it('returns a Calendar with getEvents and createEvent methods', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    const cal = CalendarApp.getCalendarById('cal123');
    expect(typeof cal.getEvents).toBe('function');
    expect(typeof cal.createEvent).toBe('function');
  });

  it('throws before spawning a subprocess if the ID is not in devResourceIds.CalendarApp', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    expect(() => CalendarApp.getCalendarById('not-allowlisted')).toThrow(/not-allowlisted/);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });
});

describe('Calendar.getEvents()', () => {
  it('returns CalendarEvents from the API response', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ items: [RAW_EVENT] }));
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    const events = CalendarApp.getCalendarById('cal123').getEvents(START, END);
    expect(events).toHaveLength(1);
  });

  it('returns events with correct title and times', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ items: [RAW_EVENT] }));
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    const [event] = CalendarApp.getCalendarById('cal123').getEvents(START, END);
    expect(event.getTitle()).toBe('Team Standup');
    expect(event.getSummary()).toBe('Team Standup');
    expect(event.getStartTime()).toEqual(new Date('2026-07-01T10:00:00Z'));
    expect(event.getEndTime()).toEqual(new Date('2026-07-01T10:30:00Z'));
  });

  it('fetches only once when getEvents is called multiple times', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ items: [RAW_EVENT] }));
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    const cal = CalendarApp.getCalendarById('cal123');
    cal.getEvents(START, END);
    cal.getEvents(START, END);
    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
  });
});

describe('Calendar.createEvent()', () => {
  it('returns a CalendarEvent with the created event data', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify(RAW_CREATED_EVENT));
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    const event = CalendarApp.getCalendarById('cal123').createEvent(
      'New Meeting',
      new Date('2026-07-01T14:00:00Z'),
      new Date('2026-07-01T15:00:00Z'),
    );
    expect(event.getTitle()).toBe('New Meeting');
    expect(event.getStartTime()).toEqual(new Date('2026-07-01T14:00:00Z'));
  });
});

describe('CalendarApp.getDefaultCalendar()', () => {
  it('uses the primary calendar', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ items: [RAW_EVENT] }));
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    CalendarApp.getDefaultCalendar().getEvents(START, END);
    const script = mockExecFileSync.mock.calls[0][1] as string[];
    expect(script).toBeDefined();
    const input = (mockExecFileSync.mock.calls[0][2] as { input: string }).input;
    expect(input).toContain('"primary"');
  });

  it('throws before spawning a subprocess if "primary" is not in devResourceIds.CalendarApp', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', { CalendarApp: ['cal123'] });
    expect(() => CalendarApp.getDefaultCalendar()).toThrow(/primary/);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });
});

describe('CalendarApp construction without credentials', () => {
  it('constructs successfully with credentialsPath/clientSecretPath undefined', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    expect(() => new CalendarAppClass(undefined, undefined, ALLOWLIST)).not.toThrow();
  });

  it('getCalendarById()/getDefaultCalendar() keep working, still gated by devResourceIds', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass(undefined, undefined, ALLOWLIST);
    expect(typeof CalendarApp.getCalendarById('cal123').getEvents).toBe('function');
    expect(() => CalendarApp.getCalendarById('not-allowlisted')).toThrow(/not-allowlisted/);
  });

  it('Calendar.getEvents() throws GasPMissingCredentialsError, not a raw crash, with no credentials configured', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass(undefined, undefined, ALLOWLIST);
    expect(() => CalendarApp.getCalendarById('cal123').getEvents(START, END)).toThrow(GasPMissingCredentialsError);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });
});

describe('CalendarApp unimplemented methods', () => {
  it('getCalendarsByName throws GasPNotImplementedError', async () => {
    const { CalendarApp: CalendarAppClass } = await import('../shims/CalendarApp.js');
    const CalendarApp = new CalendarAppClass('/fake/credentials.json', '/fake/client_secret.json', ALLOWLIST);
    expect(() => CalendarApp.getCalendarsByName('foo')).toThrow('CalendarApp.getCalendarsByName() is not yet implemented');
  });
});
