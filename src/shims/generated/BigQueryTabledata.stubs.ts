import { GasPNotImplementedError } from '../../errors.js';

export abstract class BigQueryTabledataStubs {
  insertAll(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTabledata', 'insertAll');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTabledata', 'list');
  }
}
