import { loadConfigFromFile } from 'vite';
import { dirname, resolve } from 'node:path';

export interface GasPConfig {
  srcDir: string;
  entry?: string;
  port?: number;
}

function isGasPConfig(x: unknown): x is GasPConfig {
  if (typeof x !== 'object' || x === null) return false;
  return 'srcDir' in x && typeof x.srcDir === 'string';
}

// Identity helper mirroring Vite's own defineConfig — no runtime behavior,
// just IDE type-hinting for a hand-authored gas-p.config.ts.
export function defineGasPConfig(config: GasPConfig): GasPConfig {
  return config;
}

// Reads gas-p.config.ts once (Vite's own loadConfigFromFile handles the
// TS-without-a-build-step transpile+import, the same mechanism Vite uses to
// load a consumer's vite.config.ts). srcDir is resolved relative to the
// config file's own directory, matching how Vite treats root-relative
// config fields rather than the process's cwd.
export async function loadGasPConfig(configFile: string): Promise<GasPConfig> {
  let loaded: Awaited<ReturnType<typeof loadConfigFromFile>>;
  try {
    loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, configFile);
  } catch {
    loaded = null;
  }
  if (!loaded) {
    throw new Error(`No gas-p config found at ${configFile}`);
  }
  if (!isGasPConfig(loaded.config)) {
    throw new Error(`${configFile} must export an object with a string "srcDir" field`);
  }

  const configDir = dirname(loaded.path);
  return {
    ...loaded.config,
    srcDir: resolve(configDir, loaded.config.srcDir),
  };
}
