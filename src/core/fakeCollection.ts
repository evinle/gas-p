export interface GasPFakeRecord {
  id: string;
  [key: string]: unknown;
}

export type GasPFakeCollectionFilter<T> = Partial<T> | ((record: T) => boolean);

// P is separate from T (the child's own record shape) because a child's
// foreignKey lives on T (e.g. Drive.Files.Comments' `fileId`) while `parent`
// is a collection of the parent's record shape (Drive.Files' `GasPFakeRecord`
// subtype) — the two are unrelated types, so one generic can't cover both.
export interface GasPFakeCollectionOptions<T extends GasPFakeRecord, P extends GasPFakeRecord = GasPFakeRecord> {
  readonly foreignKey?: keyof T & string;
  readonly parent?: GasPFakeCollection<P>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function matchesFilter<T extends GasPFakeRecord>(record: T, filter: GasPFakeCollectionFilter<T> | undefined): boolean {
  if (filter === undefined) return true;
  if (typeof filter === 'function') return filter(record);
  return Object.keys(filter).every((key) => record[key] === filter[key]);
}

// The shared record-collection primitive every record-CRUD-shaped fake
// (DriveApp, Drive.Files, Drive.Files.Comments, ...) builds on — see issue
// #56 and the resolution on #48. Not wired into any GAS service fake yet;
// verified directly against this public API.
export class GasPFakeCollection<T extends GasPFakeRecord> {
  private records: Map<string, T>;
  private readonly initialSeed: readonly T[];

  // Callbacks rather than a stored reference to the child collection itself —
  // a callback closes over `this` already correctly typed as
  // GasPFakeCollection<T>, so the parent never needs to hold a
  // GasPFakeCollection<SomeOtherT> under a shared/erased type parameter (which
  // would need a cast to get past the parent's own generic invariance).
  private readonly cascadeCallbacks: Array<(deletedParentId: string) => void> = [];

  constructor(seed: readonly T[] = [], options: GasPFakeCollectionOptions<T> = {}) {
    if ((options.foreignKey === undefined) !== (options.parent === undefined)) {
      throw new Error('GasPFakeCollection: foreignKey and parent must be declared together, or not at all.');
    }

    this.initialSeed = seed;
    this.records = this.toMap(seed);

    if (options.parent && options.foreignKey) {
      const foreignKey = options.foreignKey;
      options.parent.registerCascadeCallback((deletedParentId) => {
        this.removeWhere((record) => record[foreignKey] === deletedParentId);
      });
    }
  }

  private toMap(seed: readonly T[]): Map<string, T> {
    return new Map(seed.map((record) => [record.id, clone(record)]));
  }

  // Not part of the public contract — only called by a child collection's own
  // constructor (via `options.parent`), same as `parent` itself isn't meant
  // for arbitrary external mutation.
  private registerCascadeCallback(callback: (deletedParentId: string) => void): void {
    this.cascadeCallbacks.push(callback);
  }

  private removeWhere(predicate: (record: T) => boolean): void {
    for (const record of this.records.values()) {
      if (predicate(record)) this.records.delete(record.id);
    }
  }

  create(record: T): T {
    if (this.records.has(record.id)) {
      throw new Error(`GasPFakeCollection: a record with id '${record.id}' already exists.`);
    }
    const stored = clone(record);
    this.records.set(record.id, stored);
    return clone(stored);
  }

  get(id: string, filter?: GasPFakeCollectionFilter<T>): T | undefined {
    const record = this.records.get(id);
    if (record === undefined || !matchesFilter(record, filter)) return undefined;
    return clone(record);
  }

  list(filter?: GasPFakeCollectionFilter<T>): T[] {
    return [...this.records.values()].filter((record) => matchesFilter(record, filter)).map(clone);
  }

  update(id: string, record: T): T {
    if (!this.records.has(id)) {
      throw new Error(`GasPFakeCollection: cannot update — no record with id '${id}' exists.`);
    }
    const stored = clone({ ...record, id });
    this.records.set(id, stored);
    return clone(stored);
  }

  patch(id: string, patch: Partial<T>): T {
    const existing = this.records.get(id);
    if (!existing) {
      throw new Error(`GasPFakeCollection: cannot patch — no record with id '${id}' exists.`);
    }
    const stored = clone({ ...existing, ...patch, id });
    this.records.set(id, stored);
    return clone(stored);
  }

  remove(id: string): void {
    if (!this.records.has(id)) {
      throw new Error(`GasPFakeCollection: cannot remove — no record with id '${id}' exists.`);
    }
    this.records.delete(id);
    for (const callback of this.cascadeCallbacks) callback(id);
  }

  reset(newSeed?: readonly T[]): void {
    this.records = this.toMap(newSeed ?? this.initialSeed);
  }
}
