import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarColorsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarColors', 'get');
  }
}
