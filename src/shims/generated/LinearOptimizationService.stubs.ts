import { GasPNotImplementedError } from '../../errors.js';

export abstract class LinearOptimizationServiceStubs {
  createEngine(...args: unknown[]): never {
    throw new GasPNotImplementedError('LinearOptimizationService', 'createEngine');
  }
}
