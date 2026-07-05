import { GasPNotImplementedError } from '../../errors.js';

export abstract class UserStubs {
  getUserLoginId(...args: unknown[]): never {
    throw new GasPNotImplementedError('User', 'getUserLoginId');
  }
}
