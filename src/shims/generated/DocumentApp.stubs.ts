import { GasPNotImplementedError } from '../../errors.js';

export abstract class DocumentAppStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocumentApp', 'create');
  }
  getActiveDocument(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocumentApp', 'getActiveDocument');
  }
  getUi(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocumentApp', 'getUi');
  }
  openById(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocumentApp', 'openById');
  }
  openByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('DocumentApp', 'openByUrl');
  }
}
