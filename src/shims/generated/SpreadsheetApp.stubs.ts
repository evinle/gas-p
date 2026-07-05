import { GasPNotImplementedError } from '../../errors.js';

export abstract class SpreadsheetAppStubs {
  create(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'create');
  }
  enableAllDataSourcesExecution(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'enableAllDataSourcesExecution');
  }
  enableBigQueryExecution(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'enableBigQueryExecution');
  }
  flush(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'flush');
  }
  getActive(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getActive');
  }
  getActiveRange(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getActiveRange');
  }
  getActiveRangeList(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getActiveRangeList');
  }
  getActiveSheet(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getActiveSheet');
  }
  getActiveSpreadsheet(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getActiveSpreadsheet');
  }
  getCurrentCell(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getCurrentCell');
  }
  getSelection(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getSelection');
  }
  getUi(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'getUi');
  }
  newCellImage(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newCellImage');
  }
  newColor(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newColor');
  }
  newConditionalFormatRule(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newConditionalFormatRule');
  }
  newDataSourceSpec(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newDataSourceSpec');
  }
  newDataValidation(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newDataValidation');
  }
  newFilterCriteria(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newFilterCriteria');
  }
  newRichTextValue(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newRichTextValue');
  }
  newTextStyle(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'newTextStyle');
  }
  open(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'open');
  }
  openById(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'openById');
  }
  openByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'openByUrl');
  }
  setActiveRange(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'setActiveRange');
  }
  setActiveRangeList(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'setActiveRangeList');
  }
  setActiveSheet(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'setActiveSheet');
  }
  setActiveSpreadsheet(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'setActiveSpreadsheet');
  }
  setCurrentCell(...args: unknown[]): never {
    throw new GasPNotImplementedError('SpreadsheetApp', 'setCurrentCell');
  }
}
