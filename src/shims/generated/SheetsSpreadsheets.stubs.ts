import { GasPNotImplementedError } from '../../errors.js';

export abstract class SheetsSpreadsheetsStubs {
  batchUpdate(...args: unknown[]): never {
    throw new GasPNotImplementedError('SheetsSpreadsheets', 'batchUpdate');
  }
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('SheetsSpreadsheets', 'create');
  }
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('SheetsSpreadsheets', 'get');
  }
  getByDataFilter(...args: unknown[]): never {
    throw new GasPNotImplementedError('SheetsSpreadsheets', 'getByDataFilter');
  }
}
