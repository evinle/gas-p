import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { loadGasPConfig } from '../core/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'config');

describe('loadGasPConfig', () => {
  it('loads gas-p.config.ts and resolves srcDir relative to the config file', async () => {
    const configFile = join(FIXTURES, 'basic', 'gas-p.config.ts');
    const config = await loadGasPConfig(configFile);
    expect(config.srcDir).toBe(join(FIXTURES, 'basic', 'app-src'));
    expect(config.entry).toBe('Code.ts');
    expect(config.port).toBe(5555);
  });

  it('throws a clear error when the config file does not exist', async () => {
    const configFile = join(FIXTURES, 'does-not-exist', 'gas-p.config.ts');
    await expect(loadGasPConfig(configFile)).rejects.toThrow(/No gas-p config found at/);
  });
});
