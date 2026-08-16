import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveOperationStubs {
  cancel(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveOperation', 'cancel');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveOperation', 'remove');
  }
}
