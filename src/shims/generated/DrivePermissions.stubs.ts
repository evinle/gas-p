import { GasPNotImplementedError } from '../../errors.js';

export abstract class DrivePermissionsStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DrivePermissions', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DrivePermissions', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DrivePermissions', 'list');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DrivePermissions', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DrivePermissions', 'update');
  }
}
