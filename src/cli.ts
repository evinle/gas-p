#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('gas-p')
  .description('Local development runtime for Google Apps Script TypeScript codebases')
  .version(version);

program.parse();
