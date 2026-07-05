const SUPPORTED_ENCODINGS: readonly string[] = [
  'ascii',
  'utf8',
  'utf-8',
  'utf16le',
  'ucs2',
  'ucs-2',
  'base64',
  'base64url',
  'latin1',
  'binary',
  'hex',
];

export function isBufferEncoding(charset: string): charset is BufferEncoding {
  return SUPPORTED_ENCODINGS.includes(charset);
}
