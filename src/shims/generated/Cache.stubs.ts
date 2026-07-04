import { GasPNotImplementedError } from '../../errors.js';

export const CacheStubs = {
  getAll(...args: unknown[]): never {
    throw new GasPNotImplementedError('Cache', 'getAll');
  },
  putAll(...args: unknown[]): never {
    throw new GasPNotImplementedError('Cache', 'putAll');
  },
  removeAll(...args: unknown[]): never {
    throw new GasPNotImplementedError('Cache', 'removeAll');
  },
};
