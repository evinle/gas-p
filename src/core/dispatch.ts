import vm from 'node:vm';

export type RpcResult = { ok: true; value: unknown } | { ok: false; error: { message: string } };

function isCallable(x: unknown): x is (...args: unknown[]) => unknown {
  return typeof x === 'function';
}

function isErrorLike(x: unknown): x is { message: string } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('message' in x) || typeof x.message !== 'string') return false;
  return true;
}

// Values returned from the vm context can be Date instances of *that
// context's own* Date global, so `instanceof Date` (host realm) never
// matches. Object.prototype.toString reads the internal slot instead,
// which works across realms.
function isDateLike(x: unknown): x is Date {
  return Object.prototype.toString.call(x) === '[object Date]';
}

// google.script.run returns a real Date object to the client for a Date
// return value, unlike a plain JSON round-trip which would flatten it to a
// string. We can't replicate Google's actual wire format (undocumented), so
// we tag Dates with our own marker on the way out; the Transport Shim revives
// them back into Date instances on the way in.
function tagDates(value: unknown, seen: Set<unknown> = new Set()): unknown {
  if (isDateLike(value)) {
    return { __gasp_date__: value.toISOString() };
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    if (seen.has(value)) {
      throw new TypeError('Converting circular structure to JSON');
    }
    seen.add(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) => tagDates(v, seen));
  }
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = tagDates(v, seen);
    }
    return out;
  }
  return value;
}

export function handleRpcCall(context: vm.Context, fnName: string, args: unknown[]): RpcResult {
  try {
    const fn = Reflect.get(context, fnName);
    if (!isCallable(fn)) {
      throw new Error(`${fnName} is not defined`);
    }
    const returned: unknown = Reflect.apply(fn, undefined, args);
    const tagged = tagDates(returned);
    const value: unknown = tagged === undefined ? null : JSON.parse(JSON.stringify(tagged));
    return { ok: true, value };
  } catch (error) {
    const message = isErrorLike(error) ? error.message : String(error);
    return { ok: false, error: { message } };
  }
}
