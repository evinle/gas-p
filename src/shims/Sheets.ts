import { SheetsStubs } from './generated/Sheets.stubs.js';
import { SheetsSpreadsheetsStubs } from './generated/SheetsSpreadsheets.stubs.js';
import { SheetsSpreadsheetsDeveloperMetadataStubs } from './generated/SheetsSpreadsheetsDeveloperMetadata.stubs.js';
import { SheetsSpreadsheetsSheetsStubs } from './generated/SheetsSpreadsheetsSheets.stubs.js';
import { SheetsSpreadsheetsValuesStubs } from './generated/SheetsSpreadsheetsValues.stubs.js';

// Composes the advanced Sheets service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
//
// Spreadsheets nests DeveloperMetadata/Sheets/Values one further collection
// of its own, like People's ContactGroups/People — composition goes two
// levels deep here, same as there.
class SheetsSpreadsheetsDeveloperMetadata extends SheetsSpreadsheetsDeveloperMetadataStubs {}
class SheetsSpreadsheetsSheets extends SheetsSpreadsheetsSheetsStubs {}
class SheetsSpreadsheetsValues extends SheetsSpreadsheetsValuesStubs {}

class SheetsSpreadsheets extends SheetsSpreadsheetsStubs {
  DeveloperMetadata = new SheetsSpreadsheetsDeveloperMetadata();
  Sheets = new SheetsSpreadsheetsSheets();
  Values = new SheetsSpreadsheetsValues();
}

class Sheets extends SheetsStubs {
  Spreadsheets = new SheetsSpreadsheets();
}

const instance = new Sheets();
export { instance as Sheets };
