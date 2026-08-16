import { GasPNotImplementedError } from '../../errors.js';

export abstract class BigQueryProjectsStubs {
  getServiceAccount(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryProjects', 'getServiceAccount');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('BigQueryProjects', 'list');
  }
}
