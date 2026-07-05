import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveAppStubs {
  addFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'addFile');
  }
  addFolder(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'addFolder');
  }
  continueFileIterator(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'continueFileIterator');
  }
  continueFolderIterator(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'continueFolderIterator');
  }
  createFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'createFile');
  }
  createFolder(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'createFolder');
  }
  createShortcut(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'createShortcut');
  }
  createShortcutForTargetIdAndResourceKey(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'createShortcutForTargetIdAndResourceKey');
  }
  getFileById(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFileById');
  }
  getFileByIdAndResourceKey(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFileByIdAndResourceKey');
  }
  getFiles(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFiles');
  }
  getFilesByName(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFilesByName');
  }
  getFilesByType(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFilesByType');
  }
  getFolderById(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFolderById');
  }
  getFolderByIdAndResourceKey(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFolderByIdAndResourceKey');
  }
  getFolders(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFolders');
  }
  getFoldersByName(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getFoldersByName');
  }
  getRootFolder(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getRootFolder');
  }
  getStorageLimit(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getStorageLimit');
  }
  getStorageUsed(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getStorageUsed');
  }
  getTrashedFiles(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getTrashedFiles');
  }
  getTrashedFolders(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'getTrashedFolders');
  }
  removeFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'removeFile');
  }
  removeFolder(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'removeFolder');
  }
  searchFiles(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'searchFiles');
  }
  searchFolders(...args: unknown[]): never {
    throw new GasPNotImplementedError('DriveApp', 'searchFolders');
  }
}
