import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarChannelsStubs {
  stop(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarChannels', 'stop');
  }
}
