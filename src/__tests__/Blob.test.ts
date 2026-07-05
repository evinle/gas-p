import { describe, it, expect } from 'vitest';
import { Utilities } from '../shims/Utilities.js';

describe('Utilities.newBlob()', () => {
  it('wraps string data, defaulting content type to text/plain', () => {
    const blob = Utilities.newBlob('hello world');
    expect(blob.getDataAsString()).toBe('hello world');
    expect(blob.getContentType()).toBe('text/plain');
  });

  it('wraps byte array data with an explicit content type and name', () => {
    const bytes = Array.from(Buffer.from('binary-ish', 'utf-8'));
    const blob = Utilities.newBlob(bytes, 'application/octet-stream', 'data.bin');
    expect(blob.getBytes()).toEqual(bytes);
    expect(blob.getContentType()).toBe('application/octet-stream');
    expect(blob.getName()).toBe('data.bin');
  });
});

describe('Blob mutators', () => {
  it('setName/setContentType/setBytes/setDataFromString mutate in place and return the blob for chaining', () => {
    const blob = Utilities.newBlob('hello');

    const result = blob
      .setName('greeting.txt')
      .setContentType('text/x-custom')
      .setDataFromString('goodbye');

    expect(result).toBe(blob);
    expect(blob.getName()).toBe('greeting.txt');
    expect(blob.getContentType()).toBe('text/x-custom');
    expect(blob.getDataAsString()).toBe('goodbye');

    const newBytes = [1, 2, 3];
    blob.setBytes(newBytes);
    expect(blob.getBytes()).toEqual(newBytes);
  });
});

describe('Blob.copyBlob()', () => {
  it('produces an independent copy that does not change when the original is mutated', () => {
    const original = Utilities.newBlob('hello', 'text/plain', 'original.txt');
    const copy = original.copyBlob();

    original.setDataFromString('changed').setName('changed.txt');

    expect(copy.getDataAsString()).toBe('hello');
    expect(copy.getName()).toBe('original.txt');
  });
});

describe('Blob as a BlobSource', () => {
  it('getBlob() returns itself, and isGoogleType() is always false for a locally-created blob', () => {
    const blob = Utilities.newBlob('hello');
    expect(blob.getBlob()).toBe(blob);
    expect(blob.isGoogleType()).toBe(false);
  });
});
