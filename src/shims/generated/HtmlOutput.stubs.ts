import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlOutputStubs {
  getAs(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getAs');
  }
  getBlob(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getBlob');
  }
}
