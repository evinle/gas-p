import type { calendar_v3 } from 'googleapis';
import { runInSubprocess } from './subprocessBridge.js';

interface CalendarEventsCallMap {
  list: {
    params: calendar_v3.Params$Resource$Events$List;
    result: calendar_v3.Schema$Events;
  };
  insert: {
    params: calendar_v3.Params$Resource$Events$Insert;
    result: calendar_v3.Schema$Event;
  };
}

type CalendarEventsMethod = keyof CalendarEventsCallMap;

export interface GoogleApiCall<M extends CalendarEventsMethod = CalendarEventsMethod> {
  service: 'calendar';
  version: 'v3';
  resource: 'events';
  method: M;
  params: CalendarEventsCallMap[M]['params'];
}

function buildScript(credentialsPath: string, clientSecretPath: string, call: GoogleApiCall): string {
  return `
import { google } from 'googleapis';
import { readFileSync } from 'fs';
try {
  const creds = JSON.parse(readFileSync(${JSON.stringify(credentialsPath)}, 'utf-8'));
  const clientSecret = JSON.parse(readFileSync(${JSON.stringify(clientSecretPath)}, 'utf-8'));
  const { client_id, client_secret } = clientSecret.installed;
  const auth = new google.auth.OAuth2(client_id, client_secret, 'http://localhost');
  auth.setCredentials(creds);
  const client = google.${call.service}({ version: ${JSON.stringify(call.version)}, auth });
  const res = await client.${call.resource}.${call.method}(${JSON.stringify(call.params)});
  process.stdout.write(JSON.stringify(res.data));
} catch (error) {
  process.stdout.write(JSON.stringify({ __gasp_subprocess_error__: error.message ?? String(error) }));
}
`;
}

export function runGoogleApiCall<M extends CalendarEventsMethod>(
  credentialsPath: string,
  clientSecretPath: string,
  call: GoogleApiCall<M>
): CalendarEventsCallMap[M]['result'] {
  return runInSubprocess(buildScript(credentialsPath, clientSecretPath, call)) as CalendarEventsCallMap[M]['result'];
}
