import {
  buildContext,
  buildBundledContext,
  isHtmlOutput,
  type BuildContextConfig,
  type BuildBundledContextConfig,
} from './context.js';
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

export function renderDoGet(config: BuildContextConfig, userAgent?: string): string {
  const context = buildContext(config, userAgent);
  return invokeDoGet(context);
}

export async function renderDoGetBundled(config: BuildBundledContextConfig, userAgent?: string): Promise<string> {
  const context = await buildBundledContext(config, userAgent);
  return invokeDoGet(context);
}

export interface GasPSource {
  // userAgent is a per-request runtime value (unlike the rest of the source's
  // config, which is resolved once at server startup), so it's threaded
  // through as an argument to each call rather than captured by resolveSource.
  buildContext(userAgent?: string): Promise<vm.Context>;
  renderDoGet(userAgent?: string): Promise<string>;
}

export interface SourceConfig extends BuildContextConfig {
  entry?: string;
  consumerConfig?: BuildBundledContextConfig['consumerConfig'];
}

// Normalizes the raw .gs/.js (buildContext/renderDoGet) and bundled .ts
// (buildBundledContext/renderDoGetBundled) pairs behind one interface, so
// callers (Vite plugin today, any future adapter) branch on entry presence
// exactly once instead of repeating the same ternary at every call site.
export function resolveSource(config: SourceConfig): GasPSource {
  const { entry, ...rest } = config;
  if (entry) {
    const bundledConfig: BuildBundledContextConfig = { ...rest, entry };
    return {
      buildContext: (userAgent) => buildBundledContext(bundledConfig, userAgent),
      renderDoGet: (userAgent) => renderDoGetBundled(bundledConfig, userAgent),
    };
  }
  return {
    buildContext: (userAgent) => Promise.resolve(buildContext(rest, userAgent)),
    renderDoGet: (userAgent) => Promise.resolve(renderDoGet(rest, userAgent)),
  };
}
