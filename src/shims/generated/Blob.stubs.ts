import { GasPNotImplementedError } from '../../errors.js';

export abstract class BlobStubs {
  getAs(...args: unknown[]): never {
    throw new GasPNotImplementedError('Blob', 'getAs');
  }
  setContentTypeFromExtension(...args: unknown[]): never {
    throw new GasPNotImplementedError('Blob', 'setContentTypeFromExtension');
  }
  getAllBlobs(...args: unknown[]): never {
    throw new GasPNotImplementedError('Blob', 'getAllBlobs');
  }
}
