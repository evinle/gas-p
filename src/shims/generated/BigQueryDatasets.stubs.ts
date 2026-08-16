import { GasPNotImplementedError } from '../../errors.js';

export abstract class BigQueryDatasetsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'get');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'insert');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'list');
  }
  patch(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'patch');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryDatasets', 'update');
  }
}
