import { readFileSync } from 'fs';
import { join } from 'path';
import { runInSubprocess } from '../core/subprocessBridge.js';
import { buildGoogleAuthPreamble } from '../core/googleAuthScript.js';
import { SessionStubs } from './generated/Session.stubs.js';
import { UserStubs } from './generated/User.stubs.js';

interface Manifest {
  timeZone: string;
}

function isManifest(x: unknown): x is Manifest {
  if (typeof x !== 'object' || x === null) return false;
  if (!('timeZone' in x) || typeof x.timeZone !== 'string') return false;
  return true;
}

function readTimeZone(srcDir: string): string {
  const raw: unknown = JSON.parse(readFileSync(join(srcDir, 'appsscript.json'), 'utf-8'));
  if (!isManifest(raw)) throw new Error(`appsscript.json in ${srcDir} is missing a valid timeZone field`);
  return raw.timeZone;
}

interface UserInfo {
  email: string;
}

function isUserInfo(x: unknown): x is UserInfo {
  if (typeof x !== 'object' || x === null) return false;
  if (!('email' in x) || typeof x.email !== 'string') return false;
  return true;
}

function buildUserinfoScript(credentialsPath: string, clientSecretPath: string): string {
  return `
import { google } from 'googleapis';
import { readFileSync } from 'fs';
try {
  ${buildGoogleAuthPreamble(credentialsPath, clientSecretPath)}
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const res = await oauth2.userinfo.get();
  process.stdout.write(JSON.stringify(res.data));
} catch (error) {
  process.stdout.write(JSON.stringify({ __gasp_subprocess_error__: error.message ?? String(error) }));
}
`;
}

function fetchActiveUserEmail(credentialsPath: string, clientSecretPath: string): string {
  const raw = runInSubprocess(buildUserinfoScript(credentialsPath, clientSecretPath));
  if (!isUserInfo(raw)) throw new Error('Unexpected userinfo response shape');
  return raw.email;
}

function createUser(email: string) {
  return {
    ...UserStubs,
    getEmail(): string {
      return email;
    },
  };
}

export function createSession(credentialsPath: string, clientSecretPath: string, srcDir: string) {
  return {
    ...SessionStubs,
    getScriptTimeZone(): string {
      return readTimeZone(srcDir);
    },
    getActiveUser() {
      return createUser(fetchActiveUserEmail(credentialsPath, clientSecretPath));
    },
  };
}
