import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveChangesStubs {
  getStartPageToken(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveChanges', 'getStartPageToken');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveChanges', 'list');
  }
  watch(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveChanges', 'watch');
  }
}
