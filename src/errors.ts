export class GasPNotImplementedError extends Error {
  constructor(service: string, method: string) {
    super(
      `${service}.${method}() is not yet implemented in gas-p. 👉 Request it or contribute: https://github.com/evinle/gas-p/issues`
    );
    this.name = 'GasPNotImplementedError';
  }
}

export class GasPMissingCredentialsError extends Error {
  constructor(service: string, method: string) {
    super(
      `${service}.${method}() needs real Google API credentials, but none are configured and no gas-p.fixtures.ts fixture matches this call. Add a fixture for ${service}.${method}, or configure credentials (see gas-p auth).`
    );
    this.name = 'GasPMissingCredentialsError';
  }
}
