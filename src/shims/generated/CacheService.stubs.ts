import { GasPNotImplementedError } from '../../errors.js';

export const CacheServiceStubs = {
  getDocumentCache(...args: unknown[]): never {
    throw new GasPNotImplementedError('CacheService', 'getDocumentCache');
  },
  getUserCache(...args: unknown[]): never {
    throw new GasPNotImplementedError('CacheService', 'getUserCache');
  },
};
