import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveRepliesStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveReplies', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveReplies', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveReplies', 'list');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveReplies', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveReplies', 'update');
  }
}
