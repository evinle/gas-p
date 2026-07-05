import { defineGasPFixtures } from "@evinle/gas-p/fixtures";

export default defineGasPFixtures({
  CalendarApp: {
    getDefaultCalendar: () => ({
      getEvents: (start, end) => [
        {
          getTitle: () => "Edited fixture event",
          getStartTime: () => new Date("2026-02-02T10:00:00Z"),
          getEndTime: () => new Date("2026-02-02T11:00:00Z"),
        },
      ],
    }),
  },
});
