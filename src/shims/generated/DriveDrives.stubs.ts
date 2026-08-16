import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveDrivesStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'get');
  }
  hide(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'hide');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'list');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'remove');
  }
  unhide(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'unhide');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveDrives', 'update');
  }
}
