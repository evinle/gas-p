import { formatInTimeZone } from 'date-fns-tz';
import { UtilitiesStubs } from './generated/Utilities.stubs.js';
import { Blob } from './Blob.js';

class Utilities extends UtilitiesStubs {
  base64Decode(encoded: string): number[] {
    return Array.from(Buffer.from(encoded, 'base64'));
  }

  // Positional signature mirrors the real GAS Utilities.newBlob(data, contentType, name)
  // overloads exactly — GAS scripts call it that way, so it can't be regrouped into an
  // options object the way Blob's own constructor is.
  newBlob(data: number[] | string, contentType?: string, name?: string): Blob {
    return new Blob(data, { contentType, name });
  }

  formatDate(date: Date, timeZone: string, format: string): string {
    return formatInTimeZone(date, timeZone, format);
  }
}

const instance = new Utilities();
export { instance as Utilities };
