export class GasPNotImplementedError extends Error {
  constructor(service: string, method: string) {
    super(
      `${service}.${method}() is not yet implemented in gas-p. 👉 Request it or contribute: https://github.com/evinle/gas-p/issues`
    );
    this.name = 'GasPNotImplementedError';
  }
}
