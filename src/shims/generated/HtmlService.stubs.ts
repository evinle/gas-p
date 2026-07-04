import { GasPNotImplementedError } from '../../errors.js';

export const HtmlServiceStubs = {
  createTemplate(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlService', 'createTemplate');
  },
  getUserAgent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlService', 'getUserAgent');
  },
};
