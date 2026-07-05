import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlOutputStubs {
  append(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'append');
  }
  appendUntrusted(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'appendUntrusted');
  }
  asTemplate(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'asTemplate');
  }
  clear(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'clear');
  }
  getAs(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getAs');
  }
  getBlob(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getBlob');
  }
  setContent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setContent');
  }
}
