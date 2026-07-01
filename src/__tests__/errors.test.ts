import { describe, it, expect } from 'vitest';
import { GasPNotImplementedError } from '../errors.js';

describe('GasPNotImplementedError', () => {
  it('message matches the required format including the issues link', () => {
    const err = new GasPNotImplementedError('UrlFetchApp', 'fetch');
    expect(err.message).toBe(
      'UrlFetchApp.fetch() is not yet implemented in gas-p. 👉 Request it or contribute: https://github.com/evinle/gas-p/issues'
    );
  });

  it('is an instance of Error', () => {
    expect(new GasPNotImplementedError('Logger', 'log')).toBeInstanceOf(Error);
  });
});
