import { buildContext, buildBundledContext, isHtmlOutput, type ConsumerViteConfig } from './context.js';
import type vm from 'node:vm';

const HOST_ERROR_CONSTRUCTORS: Record<string, ErrorConstructor> = {
  ReferenceError,
  TypeError,
  RangeError,
  SyntaxError,
  EvalError,
  URIError,
};

function isErrorLike(x: unknown): x is { name: string; message: string } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('name' in x) || typeof x.name !== 'string') return false;
  if (!('message' in x) || typeof x.message !== 'string') return false;
  return true;
}

// Errors thrown inside the vm context are instances of *that context's own*
// Error constructors, not the host realm's — instanceof checks against them
// (e.g. `instanceof ReferenceError`) fail even for a genuine ReferenceError.
// Re-throw as a host-realm error of the same name so callers can rely on
// instanceof, matching real Apps Script's ReferenceError failure mode.
export function rethrowInHostRealm(error: unknown): never {
  if (isErrorLike(error)) {
    const HostErrorConstructor = HOST_ERROR_CONSTRUCTORS[error.name] ?? Error;
    throw new HostErrorConstructor(error.message);
  }
  throw error;
}

function invokeDoGet(context: vm.Context): string {
  try {
    const doGet = context.doGet;
    if (typeof doGet !== 'function') {
      throw new Error('doGet is not defined');
    }

    const result: unknown = doGet();
    if (!isHtmlOutput(result)) {
      throw new Error('doGet() did not return an HtmlOutput');
    }
    return result.getContent();
  } catch (error) {
    rethrowInHostRealm(error);
  }
}

export function renderDoGet(srcDir: string): string {
  const context = buildContext(srcDir);
  return invokeDoGet(context);
}

export async function renderDoGetBundled(
  srcDir: string,
  entry: string,
  consumerConfig?: ConsumerViteConfig
): Promise<string> {
  const context = await buildBundledContext(srcDir, entry, consumerConfig);
  return invokeDoGet(context);
}
