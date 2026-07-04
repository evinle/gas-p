import { buildContext, buildBundledContext, isHtmlOutput, type ConsumerViteConfig, type ServiceOptions } from './context.js';
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

export function renderDoGet(srcDir: string, services?: ServiceOptions, htmlDir?: string): string {
  const context = buildContext(srcDir, services, htmlDir);
  return invokeDoGet(context);
}

export async function renderDoGetBundled(
  srcDir: string,
  entry: string,
  consumerConfig?: ConsumerViteConfig,
  services?: ServiceOptions,
  htmlDir?: string
): Promise<string> {
  const context = await buildBundledContext(srcDir, entry, consumerConfig, services, htmlDir);
  return invokeDoGet(context);
}

export interface GasPSource {
  buildContext(): Promise<vm.Context>;
  renderDoGet(): Promise<string>;
}

// Normalizes the raw .gs/.js (buildContext/renderDoGet) and bundled .ts
// (buildBundledContext/renderDoGetBundled) pairs behind one interface, so
// callers (Vite plugin today, any future adapter) branch on entry presence
// exactly once instead of repeating the same ternary at every call site.
export function resolveSource(
  srcDir: string,
  entry: string | undefined,
  consumerConfig?: ConsumerViteConfig,
  services?: ServiceOptions,
  htmlDir?: string
): GasPSource {
  if (entry) {
    return {
      buildContext: () => buildBundledContext(srcDir, entry, consumerConfig, services, htmlDir),
      renderDoGet: () => renderDoGetBundled(srcDir, entry, consumerConfig, services, htmlDir),
    };
  }
  return {
    buildContext: () => Promise.resolve(buildContext(srcDir, services, htmlDir)),
    renderDoGet: () => Promise.resolve(renderDoGet(srcDir, services, htmlDir)),
  };
}
