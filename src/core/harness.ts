import {
  buildContext,
  buildBundledContext,
  isHtmlOutput,
  type BuildContextConfig,
  type BuildBundledContextConfig,
  type HtmlOutput,
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

// Real Apps Script injects addMetaTag()/setFaviconUrl() tags into the served
// page's <head> without mutating HtmlOutput.getContent() itself (verified
// against a real deployment — getContent() logged unchanged, but the actual
// served HTML's <head> had the tags). This mirrors that: it builds the served
// string separately, leaving getContent() pure.
function injectHeadTags(html: string, output: HtmlOutput): string {
  const tags = [
    ...output.getMetaTags().map((tag) => `<meta name="${tag.getName()}" content="${tag.getContent()}"/>`),
  ];
  const faviconUrl = output.getFaviconUrl();
  if (faviconUrl !== null) {
    tags.push(`<link rel="shortcut icon" type="image/png" href="${faviconUrl}"/>`);
  }
  if (tags.length === 0) return html;

  const headMatch = /<head[^>]*>/i.exec(html);
  if (!headMatch) {
    return `<head>${tags.join('')}</head>${html}`;
  }
  const insertAt = headMatch.index + headMatch[0].length;
  return html.slice(0, insertAt) + tags.join('') + html.slice(insertAt);
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
    return injectHeadTags(result.getContent(), result);
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
