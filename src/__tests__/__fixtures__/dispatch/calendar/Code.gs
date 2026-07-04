function getMyEvents() {
  return CalendarApp.getDefaultCalendar().getEvents(new Date('2026-07-01T00:00:00Z'), new Date('2026-07-02T00:00:00Z'));
}

function getEventsFor(id) {
  return CalendarApp.getCalendarById(id).getEvents(new Date('2026-07-01T00:00:00Z'), new Date('2026-07-02T00:00:00Z'));
}
