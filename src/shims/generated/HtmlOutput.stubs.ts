import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlOutputStubs {
  asTemplate(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'asTemplate');
  }
  getAs(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getAs');
  }
  getBlob(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getBlob');
  }
}
