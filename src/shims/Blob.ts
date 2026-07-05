import { BlobStubs } from './generated/Blob.stubs.js';

interface BlobMeta {
  contentType?: string;
  name?: string;
}

export class Blob extends BlobStubs {
  private bytes: number[];
  private contentType: string;
  private name: string | null;

  constructor(data: number[] | string, meta: BlobMeta = {}) {
    super();
    this.bytes = typeof data === 'string' ? Array.from(Buffer.from(data, 'utf-8')) : data;
    this.contentType = meta.contentType ?? (typeof data === 'string' ? 'text/plain' : 'application/octet-stream');
    this.name = meta.name ?? null;
  }

  getBytes(): number[] {
    return this.bytes;
  }

  getContentType(): string {
    return this.contentType;
  }

  getName(): string | null {
    return this.name;
  }

  // "Gets the data of this blob as a String with UTF-8 encoding." — Blob docs
  getDataAsString(): string {
    return Buffer.from(this.bytes).toString('utf-8');
  }

  setBytes(data: number[]): Blob {
    this.bytes = data;
    return this;
  }

  setContentType(contentType: string): Blob {
    this.contentType = contentType;
    return this;
  }

  setName(name: string): Blob {
    this.name = name;
    return this;
  }

  // "Sets the data of this blob from a string with UTF-8 encoding." — Blob docs
  setDataFromString(value: string): Blob {
    this.bytes = Array.from(Buffer.from(value, 'utf-8'));
    return this;
  }

  copyBlob(): Blob {
    return new Blob([...this.bytes], { contentType: this.contentType, name: this.name ?? undefined });
  }

  // BlobSource — inherited via `extends BlobSource` in the real .d.ts, which
  // the stub generator doesn't resolve (it only reads Blob's own declared
  // members), so this never appears in Blob.stubs.ts and must be hand-written.
  getBlob(): Blob {
    return this;
  }

  // "Returns whether this blob is a Google Workspace file (Sheets, Docs,
  // etc.)." — Blob docs. A locally-created Blob is never one.
  isGoogleType(): boolean {
    return false;
  }
}
