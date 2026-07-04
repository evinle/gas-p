import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

beforeEach(() => { vi.resetAllMocks(); });

describe('runGoogleApiCall()', () => {
  it('spawns a subprocess script that reads credentials + the OAuth client secret, calls the described google client method, and returns the parsed result', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ items: [] }));
    const { runGoogleApiCall } = await import('../core/googleApiCall.js');

    const result = runGoogleApiCall('/fake/credentials.json', '/fake/client_secret.json', {
      service: 'calendar',
      version: 'v3',
      resource: 'events',
      method: 'list',
      params: { calendarId: 'primary' },
    });

    expect(result).toEqual({ items: [] });
    const script = (mockExecFileSync.mock.calls[0][2] as { input: string }).input;
    expect(script).toContain('/fake/credentials.json');
    expect(script).toContain('/fake/client_secret.json');
    expect(script).toContain('client_id');
    expect(script).toContain('client_secret');
    expect(script).toContain('google.calendar');
    expect(script).toContain('.events.list(');
    expect(script).toContain('"calendarId":"primary"');
  });

  it('surfaces a subprocess-side googleapis error as a normal JS Error', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ __gasp_subprocess_error__: 'Not Found' }));
    const { runGoogleApiCall } = await import('../core/googleApiCall.js');

    expect(() =>
      runGoogleApiCall('/fake/credentials.json', '/fake/client_secret.json', {
        service: 'calendar',
        version: 'v3',
        resource: 'events',
        method: 'list',
        params: { calendarId: 'bogus' },
      })
    ).toThrow('Not Found');
  });
});
