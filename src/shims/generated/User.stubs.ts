import { GasPNotImplementedError } from '../../errors.js';

export const UserStubs = {
  getUserLoginId(...args: unknown[]): never {
    throw new GasPNotImplementedError('User', 'getUserLoginId');
  },
};
