import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveAppsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApps', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApps', 'list');
  }
}
