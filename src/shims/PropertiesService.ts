import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PropertiesStubs } from './generated/Properties.stubs.js';
import { PropertiesServiceStubs } from './generated/PropertiesService.stubs.js';

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

class Properties extends PropertiesStubs {
  constructor(private srcDir: string) {
    super();
  }

  getProperty(key: string): string | null {
    const all = readAll(this.srcDir);
    return all[key] ?? null;
  }

  setProperty(key: string, value: string): void {
    const all = readAll(this.srcDir);
    all[key] = value;
    writeAll(this.srcDir, all);
  }

  deleteProperty(key: string): void {
    const all = readAll(this.srcDir);
    delete all[key];
    writeAll(this.srcDir, all);
  }

  getProperties(): Record<string, string> {
    return readAll(this.srcDir);
  }
}

export class PropertiesService extends PropertiesServiceStubs {
  private scriptProperties: Properties;

  constructor(private srcDir: string) {
    super();
    this.scriptProperties = new Properties(srcDir);
  }

  getScriptProperties() {
    return this.scriptProperties;
  }
}
