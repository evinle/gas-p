import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveChannelsStubs {
  stop(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveChannels', 'stop');
  }
}
