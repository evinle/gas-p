import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarAclStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'get');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'insert');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'list');
  }
  patch(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'patch');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'update');
  }
  watch(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarAcl', 'watch');
  }
}
