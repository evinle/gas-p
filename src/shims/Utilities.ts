import { formatInTimeZone } from 'date-fns-tz';
import { UtilitiesStubs } from './generated/Utilities.stubs.js';

export const Utilities = {
  ...UtilitiesStubs,
  base64Decode(encoded: string): number[] {
    return Array.from(Buffer.from(encoded, 'base64'));
  },

  formatDate(date: Date, timeZone: string, format: string): string {
    return formatInTimeZone(date, timeZone, format);
  },
};
