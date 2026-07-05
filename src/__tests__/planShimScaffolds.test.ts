import { describe, it, expect } from 'vitest';
import { planShimScaffolds } from '../generator/planShimScaffolds.js';
import type { StubTarget } from '../generator/runGenerator.js';

describe('planShimScaffolds', () => {
  it('plans a scaffold for a target whose existingShimFile does not exist yet', () => {
    const targets: StubTarget[] = [
      {
        typesFile: '/fake/types.d.ts',
        qualifiedInterfaceName: 'GoogleAppsScript.Spreadsheet.SpreadsheetApp',
        outputName: 'SpreadsheetApp',
        existingShimFile: '/fake/shims/SpreadsheetApp.ts',
      },
    ];

    const plan = planShimScaffolds(targets, () => undefined);

    const scaffold = plan.get('/fake/shims/SpreadsheetApp.ts');
    expect(scaffold).toContain("import { SpreadsheetAppStubs } from './generated/SpreadsheetApp.stubs.js';");
    expect(scaffold).toContain('class SpreadsheetApp extends SpreadsheetAppStubs {}');
  });

  it('does not plan a scaffold when the shim file already exists', () => {
    const targets: StubTarget[] = [
      {
        typesFile: '/fake/types.d.ts',
        qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
        outputName: 'CacheService',
        existingShimFile: '/fake/shims/CacheService.ts',
      },
    ];

    const plan = planShimScaffolds(targets, () => 'class CacheService extends CacheServiceStubs {}');

    expect(plan.has('/fake/shims/CacheService.ts')).toBe(false);
  });

  it('does not plan a scaffold when the target has no existingShimFile path to write to', () => {
    const targets: StubTarget[] = [
      {
        typesFile: '/fake/types.d.ts',
        qualifiedInterfaceName: 'GoogleAppsScript.Drive.DriveApp',
        outputName: 'DriveApp',
      },
    ];

    const plan = planShimScaffolds(targets, () => undefined);

    expect(plan.size).toBe(0);
  });
});
