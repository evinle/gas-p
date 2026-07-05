import { GasPNotImplementedError } from '../../errors.js';

export abstract class SlidesAppStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'create');
  }
  getActivePresentation(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'getActivePresentation');
  }
  getUi(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'getUi');
  }
  newAffineTransformBuilder(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'newAffineTransformBuilder');
  }
  openById(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'openById');
  }
  openByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('SlidesApp', 'openByUrl');
  }
}
