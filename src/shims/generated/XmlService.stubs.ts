import { GasPNotImplementedError } from '../../errors.js';

export abstract class XmlServiceStubs {
  createCdata(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createCdata');
  }
  createComment(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createComment');
  }
  createDocType(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createDocType');
  }
  createDocument(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createDocument');
  }
  createElement(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createElement');
  }
  createText(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'createText');
  }
  getCompactFormat(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getCompactFormat');
  }
  getNamespace(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getNamespace');
  }
  getNoNamespace(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getNoNamespace');
  }
  getPrettyFormat(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getPrettyFormat');
  }
  getRawFormat(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getRawFormat');
  }
  getXmlNamespace(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'getXmlNamespace');
  }
  parse(...args: unknown[]): never {
    throw new GasPNotImplementedError('XmlService', 'parse');
  }
}
