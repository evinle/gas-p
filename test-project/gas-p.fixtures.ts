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
  // Advanced Calendar/People (#45) — flat vs. nested composition, exercised
  // here for real end-to-end type-checking against the built package.
  Calendar: {
    Events: {
      patch: () => ({ id: "evt-fixture" }),
    },
  },
  People: {
    ContactGroups: {
      Members: {
        modify: () => ({ resourceNames: ["people/fixture"] }),
      },
    },
  },
  Sheets: {
    Spreadsheets: {
      Values: {
        get: () => ({ values: [["fixture"]] }),
      },
    },
  },
});
