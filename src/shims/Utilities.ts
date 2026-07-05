import { formatInTimeZone } from 'date-fns-tz';
import { UtilitiesStubs } from './generated/Utilities.stubs.js';

class Utilities extends UtilitiesStubs {
  base64Decode(encoded: string): number[] {
    return Array.from(Buffer.from(encoded, 'base64'));
  }

  formatDate(date: Date, timeZone: string, format: string): string {
    return formatInTimeZone(date, timeZone, format);
  }
}

const instance = new Utilities();
export { instance as Utilities };
