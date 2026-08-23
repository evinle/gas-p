import { describe, it, expect } from 'vitest';
import { GasPNotImplementedError, GasPMissingCredentialsError, GasPFakeNotImplementedError } from '../errors.js';

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

describe('GasPFakeNotImplementedError', () => {
  it('message names the service/method and points at adding fake logic', () => {
    const err = new GasPFakeNotImplementedError('DriveApp', 'createFile');
    expect(err.message).toContain('DriveApp.createFile()');
    expect(err.message).toMatch(/fake/i);
  });

  it('is an instance of Error, distinct from GasPNotImplementedError', () => {
    const err = new GasPFakeNotImplementedError('DriveApp', 'createFile');
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(GasPNotImplementedError);
    expect(err.name).toBe('GasPFakeNotImplementedError');
  });
});

describe('GasPMissingCredentialsError', () => {
  it('message names the service/method and tells the consumer to add a fixture or configure credentials', () => {
    const err = new GasPMissingCredentialsError('Session', 'getActiveUser');
    expect(err.message).toContain('Session.getActiveUser()');
    expect(err.message).toMatch(/fixture/i);
    expect(err.message).toMatch(/credentials/i);
  });

  it('is an instance of Error, distinct from GasPNotImplementedError', () => {
    const err = new GasPMissingCredentialsError('Session', 'getActiveUser');
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(GasPNotImplementedError);
    expect(err.name).toBe('GasPMissingCredentialsError');
  });
});
