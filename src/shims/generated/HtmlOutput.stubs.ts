import { GasPNotImplementedError } from '../../errors.js';

export abstract class HtmlOutputStubs {
  addMetaTag(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'addMetaTag');
  }
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
  getFaviconUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getFaviconUrl');
  }
  getHeight(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getHeight');
  }
  getMetaTags(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getMetaTags');
  }
  getWidth(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'getWidth');
  }
  setContent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setContent');
  }
  setFaviconUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setFaviconUrl');
  }
  setHeight(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setHeight');
  }
  setSandboxMode(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setSandboxMode');
  }
  setWidth(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setWidth');
  }
  setXFrameOptionsMode(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlOutput', 'setXFrameOptionsMode');
  }
}
