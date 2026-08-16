import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveFilesStubs {
  copy(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'copy');
  }
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'create');
  }
  download(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'download');
  }
  emptyTrash(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'emptyTrash');
  }
  export(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'export');
  }
  generateIds(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'generateIds');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'get');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'list');
  }
  listLabels(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'listLabels');
  }
  modifyLabels(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'modifyLabels');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'update');
  }
  watch(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveFiles', 'watch');
  }
}
