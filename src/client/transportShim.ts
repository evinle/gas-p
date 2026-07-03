type Handler = (value: unknown, userObject?: unknown) => void;

interface RpcResponse {
  json(): Promise<unknown>;
}

interface ScriptRunOptions {
  endpoint: string;
  fetchImpl: (url: string, init: { method: string; body: string }) => Promise<RpcResponse>;
}

function isRpcSuccess(x: unknown): x is { ok: true; value: unknown } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('ok' in x) || x.ok !== true) return false;
  return 'value' in x;
}

function isRpcFailure(x: unknown): x is { ok: false; error: { message: string } } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('ok' in x) || x.ok !== false) return false;
  if (!('error' in x) || typeof x.error !== 'object' || x.error === null) return false;
  if (!('message' in x.error) || typeof x.error.message !== 'string') return false;
  return true;
}

function isDateTag(x: unknown): x is { __gasp_date__: string } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('__gasp_date__' in x) || typeof x.__gasp_date__ !== 'string') return false;
  return true;
}

// Mirrors core/dispatch.ts's tagDates on the way in: reconstructs the Date
// instances dispatch.ts tagged before JSON-serializing them, matching real
// google.script.run's behavior of returning actual Date objects to the client.
function reviveDates(value: unknown): unknown {
  if (isDateTag(value)) {
    return new Date(value.__gasp_date__);
  }
  if (Array.isArray(value)) {
    return value.map(reviveDates);
  }
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = reviveDates(v);
    }
    return out;
  }
  return value;
}

interface ChainState {
  successHandler?: Handler;
  failureHandler?: Handler;
  userObject?: unknown;
}

export type ScriptRun = Record<string, (...args: unknown[]) => void> & {
  withSuccessHandler(fn: Handler): ScriptRun;
  withFailureHandler(fn: Handler): ScriptRun;
  withUserObject(obj: unknown): ScriptRun;
};

function build(options: ScriptRunOptions, state: ChainState): ScriptRun {
  return new Proxy({} as ScriptRun, {
    get(_target, prop) {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'withSuccessHandler') {
        return (fn: Handler) => build(options, { ...state, successHandler: fn });
      }
      if (prop === 'withFailureHandler') {
        return (fn: Handler) => build(options, { ...state, failureHandler: fn });
      }
      if (prop === 'withUserObject') {
        return (obj: unknown) => build(options, { ...state, userObject: obj });
      }
      const fnName = prop;
      return (...args: unknown[]) => {
        options
          .fetchImpl(options.endpoint, {
            method: 'POST',
            body: JSON.stringify({ fnName, args }),
          })
          .then((res) => res.json())
          .then((body: unknown) => {
            if (isRpcSuccess(body)) {
              state.successHandler?.(reviveDates(body.value), state.userObject);
            } else if (isRpcFailure(body)) {
              state.failureHandler?.(body.error, state.userObject);
            }
          });
      };
    },
  });
}

export function createScriptRun(options: ScriptRunOptions): ScriptRun {
  return build(options, {});
}

// Only active when `typeof google === "undefined"` — in production the real
// google.script.run already exists, so the shim must never overwrite it.
export function installTransportShim(
  options: ScriptRunOptions,
  target: Record<string, unknown> = globalThis
): void {
  if (typeof target.google !== 'undefined') return;
  target.google = { script: { run: createScriptRun(options) } };
}
