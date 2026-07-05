import { GasPNotImplementedError } from '../../errors.js';

export abstract class BrowserStubs {
  inputBox(...args: unknown[]): never {
    throw new GasPNotImplementedError('Browser', 'inputBox');
  }
  msgBox(...args: unknown[]): never {
    throw new GasPNotImplementedError('Browser', 'msgBox');
  }
}
