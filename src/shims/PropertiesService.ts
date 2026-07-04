import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GasPNotImplementedError } from '../errors.js';

function propertiesPath(srcDir: string): string {
  return join(srcDir, 'gas-p.properties.json');
}

function ensureFileExists(srcDir: string): void {
  const path = propertiesPath(srcDir);
  if (existsSync(path)) return;
  console.warn(`gas-p.properties.json not found — created an empty one at ${path}`);
  writeFileSync(path, JSON.stringify({}, null, 2));
}

const gitignoreWarnedPaths = new Set<string>();

function warnIfNotGitignored(srcDir: string): void {
  const path = propertiesPath(srcDir);
  if (gitignoreWarnedPaths.has(path)) return;
  gitignoreWarnedPaths.add(path);

  const gitignorePath = join(srcDir, '.gitignore');
  const gitignoreContents = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf-8') : '';
  const isIgnored = gitignoreContents
    .split('\n')
    .map((line) => line.trim())
    .includes('gas-p.properties.json');

  if (!isIgnored) {
    console.warn(`gas-p.properties.json is not covered by ${gitignorePath} — add it to avoid committing local secrets.`);
  }
}

function readAll(srcDir: string): Record<string, string> {
  ensureFileExists(srcDir);
  warnIfNotGitignored(srcDir);
  const raw = readFileSync(propertiesPath(srcDir), 'utf-8');
  return JSON.parse(raw) as Record<string, string>;
}

function writeAll(srcDir: string, all: Record<string, string>): void {
  writeFileSync(propertiesPath(srcDir), JSON.stringify(all, null, 2));
}

export function createPropertiesService(srcDir: string) {
  const scriptProperties = {
    getProperty(key: string): string | null {
      const all = readAll(srcDir);
      return all[key] ?? null;
    },
    setProperty(key: string, value: string): void {
      const all = readAll(srcDir);
      all[key] = value;
      writeAll(srcDir, all);
    },
    deleteProperty(key: string): void {
      const all = readAll(srcDir);
      delete all[key];
      writeAll(srcDir, all);
    },
    getProperties(): Record<string, string> {
      return readAll(srcDir);
    },
  };

  return {
    getScriptProperties() {
      return scriptProperties;
    },
    getUserProperties(): never {
      throw new GasPNotImplementedError('PropertiesService', 'getUserProperties');
    },
    getDocumentProperties(): never {
      throw new GasPNotImplementedError('PropertiesService', 'getDocumentProperties');
    },
  };
}
