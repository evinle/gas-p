import { GasPNotImplementedError } from '../../errors.js';

export abstract class TasksStubs {
  newTask(...args: unknown[]): never {
    throw new GasPNotImplementedError('Tasks', 'newTask');
  }
  newTaskLinks(...args: unknown[]): never {
    throw new GasPNotImplementedError('Tasks', 'newTaskLinks');
  }
  newTaskList(...args: unknown[]): never {
    throw new GasPNotImplementedError('Tasks', 'newTaskList');
  }
}
