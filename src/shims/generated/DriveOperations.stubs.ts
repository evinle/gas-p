import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveOperationsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveOperations', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveOperations', 'list');
  }
}
