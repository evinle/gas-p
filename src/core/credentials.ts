import { GasPMissingCredentialsError } from '../errors.js';

// Shared by every Google-API-backed shim (CalendarApp/Session today; any
// future real DriveApp/MailApp/etc. implementation will hit the same
// problem — construct without credentials for Local mode, only demand them
// lazily at the point a real call actually needs them).
export interface GoogleCredentials {
  credentialsPath: string;
  clientSecretPath: string;
}

export function requireCredentials(
  service: string,
  method: string,
  credentials: GoogleCredentials | undefined
): GoogleCredentials {
  if (!credentials) {
    throw new GasPMissingCredentialsError(service, method);
  }
  return credentials;
}
