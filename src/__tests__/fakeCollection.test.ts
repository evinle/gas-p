import { describe, it, expect } from 'vitest';
import { GasPFakeCollection, type GasPFakeRecord } from '../core/fakeCollection.js';

interface FileRecord extends GasPFakeRecord {
  name: string;
  trashed?: boolean;
}

interface CommentRecord extends GasPFakeRecord {
  fileId: string;
  text: string;
}

describe('GasPFakeCollection — CRUD', () => {
  it('creates a record with a caller-supplied id', () => {
    const files = new GasPFakeCollection<FileRecord>();
    const created = files.create({ id: 'f1', name: 'report.txt' });
    expect(created).toEqual({ id: 'f1', name: 'report.txt' });
  });

  it('throws when creating a record whose id already exists', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'existing' }]);
    expect(() => files.create({ id: 'f1', name: 'dup' })).toThrow(/f1/);
  });

  it('gets a record by id', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'report.txt' }]);
    expect(files.get('f1')).toEqual({ id: 'f1', name: 'report.txt' });
  });

  it('returns undefined from get for a missing id', () => {
    const files = new GasPFakeCollection<FileRecord>();
    expect(files.get('missing')).toBeUndefined();
  });

  it('get with a matching partial-object filter returns the record', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a', trashed: true }]);
    expect(files.get('f1', { trashed: true })).toEqual({ id: 'f1', name: 'a', trashed: true });
  });

  it('get with a non-matching filter returns undefined even though the id exists', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a', trashed: false }]);
    expect(files.get('f1', { trashed: true })).toBeUndefined();
  });

  it('get with a predicate filter returns the record only when the predicate matches', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'alpha' }]);
    expect(files.get('f1', (f) => f.name.startsWith('al'))).toEqual({ id: 'f1', name: 'alpha' });
    expect(files.get('f1', (f) => f.name.startsWith('zz'))).toBeUndefined();
  });

  it('lists all records with no filter', () => {
    const files = new GasPFakeCollection<FileRecord>([
      { id: 'f1', name: 'a' },
      { id: 'f2', name: 'b' },
    ]);
    expect(files.list().map((f) => f.id).sort()).toEqual(['f1', 'f2']);
  });

  it('lists records filtered by a partial-object match', () => {
    const files = new GasPFakeCollection<FileRecord>([
      { id: 'f1', name: 'a', trashed: true },
      { id: 'f2', name: 'b', trashed: false },
    ]);
    expect(files.list({ trashed: true })).toEqual([{ id: 'f1', name: 'a', trashed: true }]);
  });

  it('lists records filtered by a predicate function', () => {
    const files = new GasPFakeCollection<FileRecord>([
      { id: 'f1', name: 'alpha' },
      { id: 'f2', name: 'beta' },
    ]);
    expect(files.list((f) => f.name.startsWith('al'))).toEqual([{ id: 'f1', name: 'alpha' }]);
  });

  it('updates a record, replacing it wholesale', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'old', trashed: true }]);
    const updated = files.update('f1', { id: 'f1', name: 'new' });
    expect(updated).toEqual({ id: 'f1', name: 'new' });
    expect(files.get('f1')).toEqual({ id: 'f1', name: 'new' });
  });

  it('throws when updating a record that does not exist', () => {
    const files = new GasPFakeCollection<FileRecord>();
    expect(() => files.update('missing', { id: 'missing', name: 'x' })).toThrow(/missing/);
  });

  it('patches a record, merging only the given fields', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'old', trashed: false }]);
    const patched = files.patch('f1', { trashed: true });
    expect(patched).toEqual({ id: 'f1', name: 'old', trashed: true });
  });

  it('throws when patching a record that does not exist', () => {
    const files = new GasPFakeCollection<FileRecord>();
    expect(() => files.patch('missing', { name: 'x' })).toThrow(/missing/);
  });

  it('removes a record', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a' }]);
    files.remove('f1');
    expect(files.get('f1')).toBeUndefined();
    expect(files.list()).toEqual([]);
  });

  it('throws when removing a record that does not exist', () => {
    const files = new GasPFakeCollection<FileRecord>();
    expect(() => files.remove('missing')).toThrow(/missing/);
  });

  it('protects internal state from external mutation of returned records', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a' }]);
    const got = files.get('f1')!;
    got.name = 'mutated';
    expect(files.get('f1')!.name).toBe('a');
  });
});

describe('GasPFakeCollection — seed/reset', () => {
  it('starts with exactly the seeded records', () => {
    const files = new GasPFakeCollection<FileRecord>([
      { id: 'f1', name: 'a' },
      { id: 'f2', name: 'b' },
    ]);
    expect(files.list().map((f) => f.id).sort()).toEqual(['f1', 'f2']);
  });

  it('reset() with no args restores the original constructor seed after mutation', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a' }]);
    files.create({ id: 'f2', name: 'b' });
    files.remove('f1');
    files.reset();
    expect(files.list()).toEqual([{ id: 'f1', name: 'a' }]);
  });

  it('reset(newSeed) snaps the collection to the newly supplied seed', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a' }]);
    files.reset([{ id: 'f9', name: 'z' }]);
    expect(files.list()).toEqual([{ id: 'f9', name: 'z' }]);
  });

  it('reset() with no args after reset(newSeed) still returns to the original constructor seed', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'f1', name: 'a' }]);
    files.reset([{ id: 'f9', name: 'z' }]);
    files.reset();
    expect(files.list()).toEqual([{ id: 'f1', name: 'a' }]);
  });
});

describe('GasPFakeCollection — foreign-key cascade', () => {
  function buildFilesAndComments() {
    const files = new GasPFakeCollection<FileRecord>([
      { id: 'f1', name: 'a' },
      { id: 'f2', name: 'b' },
    ]);
    const comments = new GasPFakeCollection<CommentRecord>(
      [
        { id: 'c1', fileId: 'f1', text: 'on f1 #1' },
        { id: 'c2', fileId: 'f1', text: 'on f1 #2' },
        { id: 'c3', fileId: 'f2', text: 'on f2' },
      ],
      { foreignKey: 'fileId', parent: files }
    );
    return { files, comments };
  }

  it('cascades: deleting a parent record removes all matching child records', () => {
    const { files, comments } = buildFilesAndComments();
    files.remove('f1');
    expect(comments.list().map((c) => c.id).sort()).toEqual(['c3']);
  });

  it('cascades leave unrelated children (different parent id) untouched', () => {
    const { files, comments } = buildFilesAndComments();
    files.remove('f1');
    expect(comments.get('c3')).toEqual({ id: 'c3', fileId: 'f2', text: 'on f2' });
  });

  it('a parent-scoped list call filters children by the declared foreign key', () => {
    const { comments } = buildFilesAndComments();
    expect(comments.list({ fileId: 'f1' }).map((c) => c.id).sort()).toEqual(['c1', 'c2']);
  });

  it('a parent-scoped get call returns the record only when it belongs to that parent', () => {
    const { comments } = buildFilesAndComments();
    expect(comments.get('c1', { fileId: 'f1' })).toEqual({ id: 'c1', fileId: 'f1', text: 'on f1 #1' });
    expect(comments.get('c1', { fileId: 'f2' })).toBeUndefined();
  });

  it('throws when foreignKey is declared without a parent', () => {
    expect(() => new GasPFakeCollection<CommentRecord>([], { foreignKey: 'fileId' })).toThrow();
  });

  it('throws when parent is declared without a foreignKey', () => {
    const files = new GasPFakeCollection<FileRecord>();
    expect(() => new GasPFakeCollection<CommentRecord>([], { parent: files })).toThrow();
  });
});

describe('GasPFakeCollection — independent collections', () => {
  it('two collections with no declared relationship never affect each other, even sharing ids', () => {
    const files = new GasPFakeCollection<FileRecord>([{ id: 'shared', name: 'a file' }]);
    const comments = new GasPFakeCollection<CommentRecord>([{ id: 'shared', fileId: 'x', text: 'a comment' }]);

    files.remove('shared');

    expect(files.get('shared')).toBeUndefined();
    expect(comments.get('shared')).toEqual({ id: 'shared', fileId: 'x', text: 'a comment' });
  });
});
