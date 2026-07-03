import { describe, it, expect, vi } from 'vitest';
import { createScriptRun, installTransportShim } from '../client/transportShim.js';

function fakeResponse(body: unknown) {
  return { json: () => Promise.resolve(body) };
}

describe('createScriptRun', () => {
  it('POSTs the called function name and args to the endpoint', () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ ok: true, value: 5 }));
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });

    run.add(2, 3);

    expect(fetchImpl).toHaveBeenCalledWith(
      '/__gasp/rpc',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ fnName: 'add', args: [2, 3] }),
      })
    );
  });

  it('invokes the success handler with the real return value from the server', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ ok: true, value: 5 }));
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });

    const received = new Promise<unknown>((resolve) => {
      run.withSuccessHandler(resolve).add(2, 3);
    });

    await expect(received).resolves.toBe(5);
  });

  it('invokes the failure handler with the {message}-only error when the server call fails', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(fakeResponse({ ok: false, error: { message: 'boom' } }));
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });

    const received = new Promise<unknown>((resolve) => {
      run.withFailureHandler(resolve).explode();
    });

    await expect(received).resolves.toEqual({ message: 'boom' });
  });

  it('passes the withUserObject value through to whichever handler fires', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ ok: true, value: 5 }));
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });
    const userObject = { widgetId: 'abc' };

    const receivedUserObject = new Promise<unknown>((resolve) => {
      run
        .withSuccessHandler((_value, userObj) => resolve(userObj))
        .withUserObject(userObject)
        .add(2, 3);
    });

    await expect(receivedUserObject).resolves.toBe(userObject);
  });

  it('is non-blocking: calling code continues before the response arrives', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ ok: true, value: 5 }));
    let handlerCalled = false;
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });

    run.withSuccessHandler(() => (handlerCalled = true)).add(2, 3);

    expect(handlerCalled).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(handlerCalled).toBe(true);
  });

  it('revives a __gasp_date__-tagged value back into a real Date before calling the success handler', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      fakeResponse({ ok: true, value: { __gasp_date__: '2024-01-15T10:30:00.000Z' } })
    );
    const run = createScriptRun({ endpoint: '/__gasp/rpc', fetchImpl });

    const received = new Promise<unknown>((resolve) => {
      run.withSuccessHandler(resolve).getTimestamp();
    });

    const value = await received;
    expect(value).toBeInstanceOf(Date);
    if (!(value instanceof Date)) throw new Error('expected a Date');
    expect(value.toISOString()).toBe('2024-01-15T10:30:00.000Z');
  });
});

describe('installTransportShim', () => {
  it('installs google.script.run onto the target when google is undefined', () => {
    const target: Record<string, unknown> = {};

    installTransportShim({ endpoint: '/__gasp/rpc', fetchImpl: vi.fn() }, target);

    expect(target.google).toBeDefined();
  });

  it('does not overwrite an existing google global (i.e. is inert in production)', () => {
    const realGoogle = { script: { run: 'the real thing' } };
    const target: Record<string, unknown> = { google: realGoogle };

    installTransportShim({ endpoint: '/__gasp/rpc', fetchImpl: vi.fn() }, target);

    expect(target.google).toBe(realGoogle);
  });
});
