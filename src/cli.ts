#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { readScopes, readClientSecret, runAuthFlow, saveCredentials } from './auth.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

function isPkg(x: unknown): x is { version: string } {
  return typeof x === 'object' && x !== null && 'version' in x && typeof x.version === 'string';
}

if (!isPkg(pkg)) throw new Error('Could not read version from package.json');

const GAS_P_DIR = join(homedir(), '.gas-p');
const CLIENT_SECRET_PATH = join(GAS_P_DIR, 'client_secret.json');
const CREDENTIALS_PATH = join(GAS_P_DIR, 'credentials.json');

const program = new Command();

program
  .name('gas-p')
  .description('Local development runtime for Google Apps Script TypeScript codebases')
  .version(pkg.version);

program
  .command('auth')
  .description('Authenticate with Google APIs')
  .option('--manifest <path>', 'Path to appsscript.json', join(process.cwd(), 'appsscript.json'))
  .action(async (opts: { manifest: string }) => {
    const scopes = readScopes(opts.manifest);
    const clientSecret = readClientSecret(CLIENT_SECRET_PATH);
    const credentials = await runAuthFlow(clientSecret, scopes);
    saveCredentials(credentials, CREDENTIALS_PATH);
    console.log(`Credentials saved to ${CREDENTIALS_PATH}`);
  });

program.parse();
