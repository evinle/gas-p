import { greetingFor } from "./Utils";

function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate();
}

function getGreeting(name: string) {
  return greetingFor(name);
}

function getMyEvents() {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return CalendarApp.getDefaultCalendar()
    .getEvents(now, inAWeek)
    .map((event) => ({
      title: event.getTitle(),
      start: event.getStartTime(),
      end: event.getEndTime(),
    }));
}

function getEventsForUndeclaredCalendar() {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return CalendarApp.getCalendarById("not-a-declared-calendar-id").getEvents(
    now,
    inAWeek,
  );
}

function createTestEvent() {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const event = CalendarApp.getDefaultCalendar().createEvent(
    "gas-p test event",
    start,
    end,
  );
  return {
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
  };
}

function createTestEventOnCalendar() {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const event = CalendarApp.getCalendarById("YOUR_CALENDAR_ID").createEvent(
    "gas-p test event (explicit ID)",
    start,
    end,
  );
  return {
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
  };
}
