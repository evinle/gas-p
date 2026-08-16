import { GasPNotImplementedError } from '../../errors.js';

export abstract class TasksTasklistsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'get');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'insert');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'list');
  }
  patch(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'patch');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('TasksTasklists', 'update');
  }
}
