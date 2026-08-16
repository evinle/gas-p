import { GasPNotImplementedError } from '../../errors.js';

export abstract class BigQueryTablesStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'get');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'insert');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'list');
  }
  patch(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'patch');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryTables', 'update');
  }
}
