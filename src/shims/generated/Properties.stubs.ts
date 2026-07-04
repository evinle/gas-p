import { GasPNotImplementedError } from '../../errors.js';

export const PropertiesStubs = {
  deleteAllProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('Properties', 'deleteAllProperties');
  },
  getKeys(...args: unknown[]): never {
    throw new GasPNotImplementedError('Properties', 'getKeys');
  },
  setProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('Properties', 'setProperties');
  },
};
