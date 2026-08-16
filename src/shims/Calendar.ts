import { AdvancedCalendarStubs } from './generated/AdvancedCalendar.stubs.js';
import { CalendarAclStubs } from './generated/CalendarAcl.stubs.js';
import { CalendarCalendarListStubs } from './generated/CalendarCalendarList.stubs.js';
import { CalendarCalendarsStubs } from './generated/CalendarCalendars.stubs.js';
import { CalendarChannelsStubs } from './generated/CalendarChannels.stubs.js';
import { CalendarColorsStubs } from './generated/CalendarColors.stubs.js';
import { CalendarEventsStubs } from './generated/CalendarEvents.stubs.js';
import { CalendarFreebusyStubs } from './generated/CalendarFreebusy.stubs.js';
import { CalendarSettingsStubs } from './generated/CalendarSettings.stubs.js';

// Composes the advanced Calendar service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
//
// The class stays named AdvancedCalendar (matching stubTargets.ts's
// outputName) so the generator's findImplementedMethods can find it by name
// when re-run — only the export is aliased to the sandbox-facing name
// 'Calendar' (CalendarApp.ts's own generated stub already owns the plain
// 'Calendar' output name for its per-event object, hence the divergence).
class CalendarAcl extends CalendarAclStubs {}
class CalendarCalendarList extends CalendarCalendarListStubs {}
class CalendarCalendars extends CalendarCalendarsStubs {}
class CalendarChannels extends CalendarChannelsStubs {}
class CalendarColors extends CalendarColorsStubs {}
class CalendarEvents extends CalendarEventsStubs {}
class CalendarFreebusy extends CalendarFreebusyStubs {}
class CalendarSettings extends CalendarSettingsStubs {}

class AdvancedCalendar extends AdvancedCalendarStubs {
  Acl = new CalendarAcl();
  CalendarList = new CalendarCalendarList();
  Calendars = new CalendarCalendars();
  Channels = new CalendarChannels();
  Colors = new CalendarColors();
  Events = new CalendarEvents();
  Freebusy = new CalendarFreebusy();
  Settings = new CalendarSettings();
}

const instance = new AdvancedCalendar();
export { instance as Calendar };
