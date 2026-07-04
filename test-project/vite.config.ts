import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { gasPVitePlugin } from "gas-p/vite";

const srcDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    gasPVitePlugin({
      srcDir,
      entry: "Code.ts",
      // 'primary' allowlists CalendarApp.getDefaultCalendar() against your
      // own Google Calendar for the #21/#22 manual verification below.
      // 'YOUR_CALENDAR_ID' is a placeholder for the #22 explicit-ID
      // createEvent manual test — swap in your real calendar ID locally
      // when running that test, then revert before committing.
      devResourceIds: { CalendarApp: ["primary", "YOUR_CALENDAR_ID"] },
    }),
  ],
});
