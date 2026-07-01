import { UrlFetchApp } from './shims/UrlFetchApp.js';
import { Logger } from './shims/Logger.js';

export async function run(fn: () => void): Promise<void> {
  Object.assign(globalThis, { UrlFetchApp, Logger });
  fn();
}
