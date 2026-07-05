import { describe, it, expect } from 'vitest';
import { generateShimScaffoldSource } from '../generator/shimScaffoldSource.js';

describe('generateShimScaffoldSource', () => {
  it('emits a class extending the generated stubs and a ready-to-use singleton export', () => {
    const source = generateShimScaffoldSource('SpreadsheetApp');

    expect(source).toContain("import { SpreadsheetAppStubs } from './generated/SpreadsheetApp.stubs.js';");
    expect(source).toContain('class SpreadsheetApp extends SpreadsheetAppStubs {}');
    expect(source).toContain('const instance = new SpreadsheetApp();');
    expect(source).toContain('export { instance as SpreadsheetApp };');
  });
});
