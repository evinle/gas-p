import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { applyFixtures, loadFixtures, defineGasPFixtures } from '../core/fixtures.js';
import { GasPNotImplementedError } from '../errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'fixtures');

class FakeService {
  someUnimplementedMethod(): never {
    throw new GasPNotImplementedError('FakeService', 'someUnimplementedMethod');
  }

  getEventById(id: string): never {
    throw new GasPNotImplementedError('FakeService', 'getEventById');
  }
}

describe('applyFixtures', () => {
  it('answers a call with a static fixture value instead of invoking the real method', () => {
    const instance = new FakeService();
    const wrapped = applyFixtures('FakeService', instance, {
      FakeService: { someUnimplementedMethod: 'a static value' },
    });
    expect(wrapped.someUnimplementedMethod()).toBe('a static value');
  });

  it('calls a function-form fixture with the real call\'s argument list', () => {
    const instance = new FakeService();
    const wrapped = applyFixtures('FakeService', instance, {
      FakeService: { getEventById: (id: string) => ({ id, title: `Event ${id}` }) },
    });
    expect(wrapped.getEventById('evt42')).toEqual({ id: 'evt42', title: 'Event evt42' });
  });

  it('falls through to the real method, unchanged, when no fixture matches', () => {
    const instance = new FakeService();
    const wrapped = applyFixtures('FakeService', instance, {
      FakeService: { getEventById: () => 'unrelated fixture' },
    });
    expect(() => wrapped.someUnimplementedMethod()).toThrow(GasPNotImplementedError);
  });

  it('returns the instance unchanged when no fixtures are declared for that service at all', () => {
    const instance = new FakeService();
    const wrapped = applyFixtures('FakeService', instance, {});
    expect(() => wrapped.someUnimplementedMethod()).toThrow(GasPNotImplementedError);
  });
});

describe('loadFixtures', () => {
  it('reads and parses a gas-p.fixtures.ts file from disk', async () => {
    const fixturesFile = join(FIXTURES, 'basic', 'gas-p.fixtures.ts');
    const fixtures = await loadFixtures(fixturesFile);
    expect(fixtures).toEqual({ SpreadsheetApp: { someUnimplementedMethod: 'a static value' } });
  });

  it('returns an empty object when no fixturesFile path is given', async () => {
    const fixtures = await loadFixtures(undefined);
    expect(fixtures).toEqual({});
  });

  it('returns an empty object when the given fixturesFile does not exist on disk', async () => {
    const fixtures = await loadFixtures(join(FIXTURES, 'does-not-exist', 'gas-p.fixtures.ts'));
    expect(fixtures).toEqual({});
  });

  it('reads fresh from disk on every call — editing the file between calls changes the next read', async () => {
    const scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-fixtures-'));
    const fixturesFile = join(scratchDir, 'gas-p.fixtures.ts');
    try {
      writeFileSync(fixturesFile, "export default { SpreadsheetApp: { m: 'first' } };");
      expect(await loadFixtures(fixturesFile)).toEqual({ SpreadsheetApp: { m: 'first' } });

      writeFileSync(fixturesFile, "export default { SpreadsheetApp: { m: 'second' } };");
      expect(await loadFixtures(fixturesFile)).toEqual({ SpreadsheetApp: { m: 'second' } });
    } finally {
      rmSync(scratchDir, { recursive: true, force: true });
    }
  });
});

describe('defineGasPFixtures', () => {
  it('is a pure identity function', () => {
    const fixtures = { SpreadsheetApp: { someMethod: 'value' } };
    expect(defineGasPFixtures(fixtures)).toBe(fixtures);
  });
});
