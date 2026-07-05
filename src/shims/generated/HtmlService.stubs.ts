import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlServiceStubs {
  getUserAgent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlService', 'getUserAgent');
  }
}
