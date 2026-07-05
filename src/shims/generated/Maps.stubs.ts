import { GasPNotImplementedError } from '../../errors.js';

export abstract class MapsStubs {
  decodePolyline(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'decodePolyline');
  }
  encodePolyline(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'encodePolyline');
  }
  newDirectionFinder(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'newDirectionFinder');
  }
  newElevationSampler(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'newElevationSampler');
  }
  newGeocoder(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'newGeocoder');
  }
  newStaticMap(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'newStaticMap');
  }
  setAuthentication(...args: unknown[]): never {
    throw new GasPNotImplementedError('Maps', 'setAuthentication');
  }
}
