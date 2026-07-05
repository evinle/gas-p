import { GasPNotImplementedError } from '../../errors.js';

export abstract class ContentServiceStubs {
  createTextOutput(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContentService', 'createTextOutput');
  }
}
