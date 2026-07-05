import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HtmlServiceStubs } from './generated/HtmlService.stubs.js';
import { HtmlOutputStubs } from './generated/HtmlOutput.stubs.js';
import { HtmlTemplateStubs } from './generated/HtmlTemplate.stubs.js';
import { Blob } from './Blob.js';

export function isHtmlOutput(x: unknown): x is HtmlOutput {
  if (typeof x !== 'object' || x === null) return false;
  if (!('getContent' in x)) return false;
  return typeof Reflect.get(x, 'getContent') === 'function';
}

const SCRIPTLET_PATTERN = /<\?(=|!=|#)([\s\S]*?)\?>/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function evaluateTemplate(raw: string, context: vm.Context): string {
  return raw.replace(SCRIPTLET_PATTERN, (_match, tag: string, expr: string) => {
    if (tag === '#') return '';
    const value = String(vm.runInContext(expr, context));
    return tag === '=' ? escapeHtml(value) : value;
  });
}

class HtmlOutputMetaTag {
  constructor(
    private name: string,
    private content: string
  ) {}

  getName(): string {
    return this.name;
  }

  getContent(): string {
    return this.content;
  }
}

export class HtmlOutput extends HtmlOutputStubs {
  private title: string | undefined;
  private width: number | null = null;
  private height: number | null = null;
  private faviconUrl: string | null = null;
  private metaTags: HtmlOutputMetaTag[] = [];

  constructor(
    private content: string,
    private context: vm.Context
  ) {
    super();
  }

  getContent(): string {
    return this.content;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  setTitle(newTitle: string): HtmlOutput {
    this.title = newTitle;
    return this;
  }

  // "Gets the initial width of the custom dialog..." — HtmlOutput docs.
  getWidth(): number | null {
    return this.width;
  }

  setWidth(width: number): HtmlOutput {
    this.width = width;
    return this;
  }

  // "Gets the initial height of the custom dialog..." — HtmlOutput docs.
  getHeight(): number | null {
    return this.height;
  }

  setHeight(height: number): HtmlOutput {
    this.height = height;
    return this;
  }

  // "Gets the URL for a favicon link tag added to the page by calling
  // setFaviconUrl(iconUrl)." — HtmlOutput docs.
  getFaviconUrl(): string | null {
    return this.faviconUrl;
  }

  setFaviconUrl(iconUrl: string): HtmlOutput {
    this.faviconUrl = iconUrl;
    return this;
  }

  addMetaTag(name: string, content: string): HtmlOutput {
    this.metaTags.push(new HtmlOutputMetaTag(name, content));
    return this;
  }

  // "Gets an array of objects that represent meta tags added to the page by
  // calling addMetaTag(name, content)." — HtmlOutput docs. Each entry
  // exposes getName()/getContent(), matching the real HtmlOutputMetaTag
  // shape rather than a plain {name, content} object. This tracked state
  // (not getContent() itself) is what harness.ts's injectHeadTags() reads to
  // build the served page's <head> — see ADR 0007.
  getMetaTags(): HtmlOutputMetaTag[] {
    return this.metaTags;
  }

  // "This method now has no effect — previously it set the sandbox mode
  // used for client-side scripts." — HtmlOutput docs.
  setSandboxMode(): HtmlOutput {
    return this;
  }

  // "Appends new content to the content of this HtmlOutput. Use this only
  // for content from a trusted source, because it is not escaped." — docs.
  append(addedContent: string): HtmlOutput {
    this.content += addedContent;
    return this;
  }

  // "Appends new content ... using contextual escaping." — docs. Real GAS
  // escapes based on surrounding HTML context (text/attribute/script/etc);
  // this only covers the plain-HTML-text case (same escaping as a <?= ?>
  // scriptlet), not full contextual autoescaping.
  appendUntrusted(addedContent: string): HtmlOutput {
    this.content += escapeHtml(addedContent);
    return this;
  }

  // "Clears the current content." — HtmlOutput docs.
  clear(): HtmlOutput {
    this.content = '';
    return this;
  }

  // "Sets the content of this HtmlOutput." — HtmlOutput docs.
  setContent(content: string): HtmlOutput {
    this.content = content;
    return this;
  }

  // Deliberately left as a no-op — real Apps Script execution showed no
  // X-Frame-Options header at all for the DEFAULT case (contradicting both
  // the vague docs and the commonly-claimed SAMEORIGIN value), so there's no
  // verified contract to implement against. See ADR 0006.
  setXFrameOptionsMode(): HtmlOutput {
    return this;
  }

  // "Returns an HtmlTemplate backed by this HtmlOutput ... Future changes to
  // HtmlOutput affect the contents of the HtmlTemplate as well." — docs. The
  // closure reads this.content live rather than snapshotting it, so edits
  // made via append()/setContent()/etc. after asTemplate() are reflected.
  asTemplate(): HtmlTemplate {
    return new HtmlTemplate(() => this.content, this.context);
  }

  // "Return the data inside this object as a blob." — HtmlOutput docs.
  // text/html matches the object's native format.
  getBlob(): Blob {
    return new Blob(this.content, { contentType: 'text/html' });
  }

  // "Return the data inside this object as a blob converted to the
  // specified content type." — HtmlOutput docs. Real format conversion
  // isn't implementable locally, so this tags the same content with the
  // requested content type rather than converting it.
  getAs(contentType: string): Blob {
    return new Blob(this.content, { contentType });
  }
}

class HtmlTemplate extends HtmlTemplateStubs {
  constructor(
    private getRaw: () => string,
    private context: vm.Context
  ) {
    super();
  }

  evaluate(): HtmlOutput {
    return new HtmlOutput(evaluateTemplate(this.getRaw(), this.context), this.context);
  }

  // "Returns the unprocessed content of this template." — HtmlTemplate docs.
  getRawContent(): string {
    return this.getRaw();
  }
}

// createTemplateFromFile's evaluate() needs a live reference to the sandbox's
// own vm.Context to run <?= ?> scriptlet expressions against the script's own
// globals — unlike the rest of this shim, it can't be decoupled from the vm.
export class HtmlService extends HtmlServiceStubs {
  // Data properties on the real GAS HtmlService interface (not methods), so
  // the stub generator's method-surface extraction never sees them — scripts
  // need real values here to pass to setSandboxMode()/setXFrameOptionsMode().
  readonly SandboxMode = { EMULATED: 'EMULATED', IFRAME: 'IFRAME', NATIVE: 'NATIVE' };
  readonly XFrameOptionsMode = { ALLOWALL: 'ALLOWALL', DEFAULT: 'DEFAULT' };

  // Three self-evident, differently-typed params (path, vm sandbox, optional
  // UA string) at a single internal call site (context.ts) — kept positional
  // rather than grouped per the object-grouping guideline in CONTRIBUTING.md,
  // since there's no real ordering-mixup risk here.
  constructor(
    private srcDir: string,
    private context: vm.Context,
    private userAgent?: string
  ) {
    super();
  }

  // "Gets the user-agent string for the current browser." — HtmlService
  // docs. Only meaningful for a real doGet() request; undefined for an RPC
  // (google.script.run) call with no browser context to report.
  getUserAgent(): string | undefined {
    return this.userAgent;
  }

  createTemplateFromFile(filename: string) {
    const raw = readFileSync(join(this.srcDir, `${filename}.html`), 'utf-8');
    return new HtmlTemplate(() => raw, this.context);
  }

  // "Creates a new HtmlTemplate object that can be returned from the
  // script." — HtmlService docs. Same scriptlet evaluation as
  // createTemplateFromFile, just from a literal string instead of a file.
  createTemplate(html: string) {
    return new HtmlTemplate(() => html, this.context);
  }

  createHtmlOutputFromFile(filename: string): HtmlOutput {
    const content = readFileSync(join(this.srcDir, `${filename}.html`), 'utf-8');
    return new HtmlOutput(content, this.context);
  }

  createHtmlOutput(html = ''): HtmlOutput {
    return new HtmlOutput(html, this.context);
  }
}
