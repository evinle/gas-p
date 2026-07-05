import { GasPNotImplementedError } from '../../errors.js';

export abstract class PropertiesServiceStubs {
  getDocumentProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('PropertiesService', 'getDocumentProperties');
  }
  getUserProperties(...args: unknown[]): never {
    throw new GasPNotImplementedError('PropertiesService', 'getUserProperties');
  }
}
