import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveAboutStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveAbout', 'get');
  }
}
