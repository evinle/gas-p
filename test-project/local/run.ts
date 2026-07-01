import { run } from 'gas-p';

await run(() => {
  const res = UrlFetchApp.fetch('https://www.google.com');
  Logger.log(res.getResponseCode());

  const cal = CalendarApp.getDefaultCalendar();
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = cal.getEvents(now, weekFromNow);
  Logger.log(`Found ${events.length} events in the next 7 days`);
  for (const event of events) {
    Logger.log(`${event.getTitle()} — ${event.getStartTime().toISOString()}`);
  }
});
