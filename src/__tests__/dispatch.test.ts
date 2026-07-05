import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { buildContext } from '../core/context.js';
import { handleRpcCall } from '../core/dispatch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '__fixtures__', 'dispatch');

describe('handleRpcCall', () => {
  it('calls the named function with the given args and returns its result wrapped in {ok: true, value}', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'basic') });
    const result = handleRpcCall(context, 'add', [2, 3]);
    expect(result).toEqual({ ok: true, value: 5 });
  });

  it('wraps a thrown exception as {ok: false, error: {message}} with no stack trace', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'throws') });
    const result = handleRpcCall(context, 'explode', []);
    expect(result).toEqual({ ok: false, error: { message: 'boom' } });
  });

  it('coerces an undefined return value to null, matching google.script.run JSON semantics', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-undefined') });
    const result = handleRpcCall(context, 'doNothing', []);
    expect(result).toEqual({ ok: true, value: null });
  });

  it('strips non-serializable properties (e.g. functions) from the returned value', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-nonserializable') });
    const result = handleRpcCall(context, 'getPayload', []);
    expect(result).toEqual({ ok: true, value: { name: 'gas-p' } });
  });

  it('tags a returned Date so the Transport Shim can revive it, instead of flattening it to a plain string', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-date') });
    const result = handleRpcCall(context, 'getTimestamp', []);
    expect(result).toEqual({
      ok: true,
      value: { __gasp_date__: '2024-01-15T10:30:00.000Z' },
    });
  });

  it('surfaces a circular return value as an RPC error instead of crashing the server', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-circular') });
    const result = handleRpcCall(context, 'getCircular', []);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected ok: false');
    expect(result.error.message).toMatch(/circular/i);
  });

  it('coerces NaN and +/-Infinity to null, matching JSON serialization semantics', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-non-finite-numbers') });
    const result = handleRpcCall(context, 'getWeirdNumbers', []);
    expect(result).toEqual({
      ok: true,
      value: { nan: null, positiveInfinity: null, negativeInfinity: null },
    });
  });

  it('does not await a returned Promise, replicating real Apps Script rather than resolving it', () => {
    const context = buildContext({ srcDir: join(FIXTURES, 'returns-promise') });
    const result = handleRpcCall(context, 'getAsyncValue', []);
    expect(result).toEqual({ ok: true, value: {} });
  });
});
