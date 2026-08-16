import { GasPNotImplementedError } from '../../errors.js';

export abstract class SheetsSpreadsheetsSheetsStubs {
  copyTo(...args: unknown[]): never {
    throw new GasPNotImplementedError('SheetsSpreadsheetsSheets', 'copyTo');
  }
}
