import { AdvancedCalendarStubs } from './generated/AdvancedCalendar.stubs.js';
import { CalendarEventsStubs } from './generated/CalendarEvents.stubs.js';

// Composes the advanced Calendar service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
class CalendarEvents extends CalendarEventsStubs {}

class Calendar extends AdvancedCalendarStubs {
  Events = new CalendarEvents();
}

const instance = new Calendar();
export { instance as Calendar };

