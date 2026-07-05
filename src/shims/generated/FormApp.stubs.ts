import { GasPNotImplementedError } from '../../errors.js';

export abstract class FormAppStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'create');
  }
  createCheckboxGridValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createCheckboxGridValidation');
  }
  createCheckboxValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createCheckboxValidation');
  }
  createFeedback(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createFeedback');
  }
  createGridValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createGridValidation');
  }
  createParagraphTextValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createParagraphTextValidation');
  }
  createTextValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'createTextValidation');
  }
  getActiveForm(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'getActiveForm');
  }
  getUi(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'getUi');
  }
  openById(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'openById');
  }
  openByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('FormApp', 'openByUrl');
  }
}
