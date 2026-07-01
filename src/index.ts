import { join } from 'path';
import { homedir } from 'os';
import { UrlFetchApp } from './shims/UrlFetchApp.js';
import { Logger } from './shims/Logger.js';
import { createCalendarApp } from './shims/CalendarApp.js';
import { readClientSecret, readStoredCredentials, buildOAuth2Client, saveCredentials } from './auth.js';

const GAS_P_DIR = join(homedir(), '.gas-p');
const CLIENT_SECRET_PATH = join(GAS_P_DIR, 'client_secret.json');
const CREDENTIALS_PATH = join(GAS_P_DIR, 'credentials.json');

export async function run(fn: () => void): Promise<void> {
  const storedCreds = readStoredCredentials(CREDENTIALS_PATH);
  if (storedCreds) {
    const clientSecret = readClientSecret(CLIENT_SECRET_PATH);
    const oauth2Client = buildOAuth2Client(clientSecret, storedCreds);
    await oauth2Client.getAccessToken();
    const c = oauth2Client.credentials;
    if (typeof c.access_token === 'string' && typeof c.refresh_token === 'string' && typeof c.expiry_date === 'number') {
      saveCredentials({ access_token: c.access_token, refresh_token: c.refresh_token, expiry_date: c.expiry_date }, CREDENTIALS_PATH);
    }
  }

  const CalendarApp = createCalendarApp(CREDENTIALS_PATH);
  Object.assign(globalThis, { UrlFetchApp, Logger, CalendarApp });
  fn();
}
