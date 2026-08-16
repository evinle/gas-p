import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarSettingsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarSettings', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarSettings', 'list');
  }
  watch(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarSettings', 'watch');
  }
}
