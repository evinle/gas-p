import { GasPNotImplementedError } from '../../errors.js';

export abstract class LanguageAppStubs {
  translate(...args: unknown[]): never {
    throw new GasPNotImplementedError('LanguageApp', 'translate');
  }
}
