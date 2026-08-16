import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarFreebusyStubs {
  query(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarFreebusy', 'query');
  }
}
