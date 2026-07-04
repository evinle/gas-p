// Shared OAuth2 setup boilerplate for subprocess scripts that call a
// googleapis client (Calendar, Session's userinfo lookup, ...). Each caller
// wraps this in its own imports/try-catch and appends the actual API call.
export function buildGoogleAuthPreamble(credentialsPath: string, clientSecretPath: string): string {
  return `
const creds = JSON.parse(readFileSync(${JSON.stringify(credentialsPath)}, 'utf-8'));
const clientSecret = JSON.parse(readFileSync(${JSON.stringify(clientSecretPath)}, 'utf-8'));
const { client_id, client_secret } = clientSecret.installed;
const auth = new google.auth.OAuth2(client_id, client_secret, 'http://localhost');
auth.setCredentials(creds);
`;
}
