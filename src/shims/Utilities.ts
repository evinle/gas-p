import { formatInTimeZone } from 'date-fns-tz';
import { GasPNotImplementedError } from '../errors.js';

export const Utilities = {
  base64Decode(encoded: string): number[] {
    return Array.from(Buffer.from(encoded, 'base64'));
  },

  formatDate(date: Date, timeZone: string, format: string): string {
    return formatInTimeZone(date, timeZone, format);
  },

  base64Encode(_data: string | number[]): never {
    throw new GasPNotImplementedError('Utilities', 'base64Encode');
  },

  computeDigest(): never {
    throw new GasPNotImplementedError('Utilities', 'computeDigest');
  },

  getUuid(): never {
    throw new GasPNotImplementedError('Utilities', 'getUuid');
  },
};
