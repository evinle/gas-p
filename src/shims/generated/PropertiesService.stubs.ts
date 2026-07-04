import { GasPNotImplementedError } from '../../errors.js';

export const PropertiesServiceStubs = {
  getDocumentProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('PropertiesService', 'getDocumentProperties');
  },
  getUserProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('PropertiesService', 'getUserProperties');
  },
};
