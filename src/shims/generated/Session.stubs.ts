import { GasPNotImplementedError } from '../../errors.js';

export const SessionStubs = {
  getActiveUserLocale(...args: unknown[]): never {
    throw new GasPNotImplementedError('Session', 'getActiveUserLocale');
  },
  getEffectiveUser(...args: unknown[]): never {
    throw new GasPNotImplementedError('Session', 'getEffectiveUser');
  },
  getTemporaryActiveUserKey(...args: unknown[]): never {
    throw new GasPNotImplementedError('Session', 'getTemporaryActiveUserKey');
  },
  getTimeZone(...args: unknown[]): never {
    throw new GasPNotImplementedError('Session', 'getTimeZone');
  },
  getUser(...args: unknown[]): never {
    throw new GasPNotImplementedError('Session', 'getUser');
  },
};
