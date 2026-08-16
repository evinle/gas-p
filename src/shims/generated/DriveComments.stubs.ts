import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveCommentsStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveComments', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveComments', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveComments', 'list');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveComments', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveComments', 'update');
  }
}
