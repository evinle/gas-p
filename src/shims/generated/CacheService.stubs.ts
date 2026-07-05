import { GasPNotImplementedError } from '../../errors.js';

export abstract class CacheServiceStubs {
  getDocumentCache(...args: unknown[]): never {
    throw new GasPNotImplementedError('CacheService', 'getDocumentCache');
  }
  getUserCache(...args: unknown[]): never {
    throw new GasPNotImplementedError('CacheService', 'getUserCache');
  }
}
