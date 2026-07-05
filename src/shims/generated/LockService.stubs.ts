import { GasPNotImplementedError } from '../../errors.js';

export abstract class LockServiceStubs {
  getDocumentLock(...args: unknown[]): never {
    throw new GasPNotImplementedError('LockService', 'getDocumentLock');
  }
  getScriptLock(...args: unknown[]): never {
    throw new GasPNotImplementedError('LockService', 'getScriptLock');
  }
  getUserLock(...args: unknown[]): never {
    throw new GasPNotImplementedError('LockService', 'getUserLock');
  }
}
