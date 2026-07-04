function createEventFor(id, title, startISO, endISO) {
  const event = CalendarApp.getCalendarById(id).createEvent(title, new Date(startISO), new Date(endISO));
  return {
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
  };
}
