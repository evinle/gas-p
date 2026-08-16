import { GasPNotImplementedError } from '../../errors.js';

export abstract class BigQueryJobsStubs {
  cancel(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'cancel');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'get');
  }
  getQueryResults(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'getQueryResults');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'insert');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'list');
  }
  query(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryJobs', 'query');
  }
}
