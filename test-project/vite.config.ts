import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { gasPVitePlugin } from 'gas-p/vite';

const srcDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    gasPVitePlugin({
      srcDir,
      entry: 'Code.ts',
      // 'primary' allowlists CalendarApp.getDefaultCalendar() against your
      // own Google Calendar for the #21 manual verification below.
      devResourceIds: { CalendarApp: ['primary'] },
    }),
  ],
});
