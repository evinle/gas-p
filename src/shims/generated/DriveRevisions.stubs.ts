import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveRevisionsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveRevisions', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveRevisions', 'list');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveRevisions', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveRevisions', 'update');
  }
}
