import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlServiceStubs {
  createTemplate(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlService', 'createTemplate');
  }
  getUserAgent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlService', 'getUserAgent');
  }
}
