import { GasPNotImplementedError } from '../../errors.js';

export abstract class DocsDocumentsStubs {
  batchUpdate(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocsDocuments', 'batchUpdate');
  }
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocsDocuments', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocsDocuments', 'get');
  }
}
