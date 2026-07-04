import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GasPNotImplementedError } from '../errors.js';
import { mkdtempSync, rmSync, cpSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, '__fixtures__', 'properties', 'basic');

let scratchDir: string;

beforeEach(() => {
  scratchDir = mkdtempSync(join(tmpdir(), 'gas-p-properties-'));
  cpSync(FIXTURE, scratchDir, { recursive: true });
});

afterEach(() => {
  rmSync(scratchDir, { recursive: true, force: true });
});

describe('PropertiesService.getScriptProperties().getProperty()', () => {
  it('reads a value from gas-p.properties.json', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    expect(props.getScriptProperties().getProperty('API_KEY')).toBe('secret123');
  });

  it('returns null for a key that is not in gas-p.properties.json', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    expect(props.getScriptProperties().getProperty('NOT_THERE')).toBeNull();
  });
});

describe('PropertiesService.getScriptProperties().setProperty()', () => {
  it('writes the new value to gas-p.properties.json immediately', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    props.getScriptProperties().setProperty('NEW_KEY', 'new-value');

    const onDisk = JSON.parse(readFileSync(join(scratchDir, 'gas-p.properties.json'), 'utf-8'));
    expect(onDisk.NEW_KEY).toBe('new-value');
    expect(props.getScriptProperties().getProperty('NEW_KEY')).toBe('new-value');
  });

  it('does not clobber existing keys when writing a new one', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    props.getScriptProperties().setProperty('NEW_KEY', 'new-value');
    expect(props.getScriptProperties().getProperty('API_KEY')).toBe('secret123');
  });
});

describe('PropertiesService.getScriptProperties().deleteProperty()', () => {
  it('removes the key from gas-p.properties.json immediately', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    props.getScriptProperties().deleteProperty('API_KEY');

    expect(props.getScriptProperties().getProperty('API_KEY')).toBeNull();
    const onDisk = JSON.parse(readFileSync(join(scratchDir, 'gas-p.properties.json'), 'utf-8'));
    expect('API_KEY' in onDisk).toBe(false);
  });
});

describe('PropertiesService.getScriptProperties().getProperties()', () => {
  it('returns all key-value pairs', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    expect(props.getScriptProperties().getProperties()).toEqual({
      API_KEY: 'secret123',
      ORG_ID: 'org-456',
    });
  });
});

describe('PropertiesService missing gas-p.properties.json', () => {
  it('warns and creates an empty file on first use, instead of crashing', async () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'gas-p-properties-empty-'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { createPropertiesService } = await import('../shims/PropertiesService.js');
      const props = createPropertiesService(emptyDir);
      expect(props.getScriptProperties().getProperty('ANYTHING')).toBeNull();
      expect(existsSync(join(emptyDir, 'gas-p.properties.json'))).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('gas-p.properties.json'));
    } finally {
      warnSpy.mockRestore();
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

describe('PropertiesService .gitignore check', () => {
  it('warns once if gas-p.properties.json is not covered by the project .gitignore', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { createPropertiesService } = await import('../shims/PropertiesService.js');
      const props = createPropertiesService(scratchDir);
      props.getScriptProperties().getProperty('API_KEY');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('.gitignore'));

      warnSpy.mockClear();
      props.getScriptProperties().getProperty('API_KEY');
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('does not warn when gas-p.properties.json is already covered by .gitignore', async () => {
    writeFileSync(join(scratchDir, '.gitignore'), 'gas-p.properties.json\n');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { createPropertiesService } = await import('../shims/PropertiesService.js');
      const props = createPropertiesService(scratchDir);
      props.getScriptProperties().getProperty('API_KEY');
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('.gitignore'));
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe('PropertiesService unimplemented methods', () => {
  it('getUserProperties throws GasPNotImplementedError', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    expect(() => props.getUserProperties()).toThrow(GasPNotImplementedError);
  });

  it('getDocumentProperties throws GasPNotImplementedError', async () => {
    const { createPropertiesService } = await import('../shims/PropertiesService.js');
    const props = createPropertiesService(scratchDir);
    expect(() => props.getDocumentProperties()).toThrow(GasPNotImplementedError);
  });
});
