# Contributing to gas-p

## Setup

```bash
npm install
npm test
```

`npm run build` compiles `src/` to `dist/` via `tsc`. The published package only ships `dist/` (plus `README.md`/`LICENSE`) — see `package.json`'s `files`/`exports`.

## Project context

- [`CONTEXT.md`](CONTEXT.md) — domain glossary (Runtime Harness, Transport Shim, Live mode, Shim/Stub, ...). Read this first; the codebase and tests use this vocabulary throughout.
- [`docs/adr/`](docs/adr/) — architecture decision records for the non-obvious tradeoffs (e.g. why Live mode has no write queue).
- [`gas-local-dev-architecture.md`](gas-local-dev-architecture.md) — full design and v1 scope.
- [`test-project/`](test-project/) — a real GAS web app wired to a local `gas-p` (via `file:..`), used for manual end-to-end verification.

## Testing

- Tests live in `src/__tests__/`, run via `vitest` (`npm test` / `npm run test:watch`).
- Prefer integration-style tests that exercise real code paths through public interfaces over tests that mock internal collaborators.
- Use fixture files under `src/__tests__/__fixtures__/` for happy-path inputs; reserve inline `fs.writeFileSync` for error-case inputs that need to be malformed or missing fields.

## TypeScript

No type assertions (`as SomeType`). Write explicit guard functions that check both key existence and value type (`'key' in x && typeof x.key === 'string'`) — TypeScript narrows correctly after that, without a cast.

## Reporting a missing method or a bug

`gas-p` implements GAS global services (`CalendarApp`, `UrlFetchApp`, ...) incrementally — an unimplemented method throws `GasPNotImplementedError`. Use the **Missing method / feature request** issue template to ask for one, or **Bug report** if something behaves differently than real Apps Script.

## Filling in a stub

Every method on the real `@types/google-apps-script` surface exists somewhere in `src/shims/` — either as a real implementation, or as a generated stub that throws `GasPNotImplementedError`.

1. **Find the stub.** Generated stubs live in `src/shims/generated/<Interface>.stubs.ts`, one file per GAS interface (e.g. `CacheService.stubs.ts` for the `CacheService` singleton, `Cache.stubs.ts` for the object it returns from `getScriptCache()`). Search for the method name there, or just call it and read the `GasPNotImplementedError` message — it names the interface and method directly.
2. **Replace it with a real implementation.** The hand-written shim module for that service (e.g. `src/shims/CacheService.ts`) spreads the generated stub object and then overrides individual methods:

   ```ts
   import { CacheServiceStubs } from './generated/CacheService.stubs.js';

   export const CacheService = {
     ...CacheServiceStubs,
     getUserCache() {
       /* real implementation */
     },
   };
   ```

   Add your real implementation as a plain method on the exported object (or object literal, depending on the shim) — do **not** edit the generated `*.stubs.ts` file directly, it will be overwritten.
3. **Regenerate.** Run `npm run generate:stubs` after your change. Because the generator scans the hand-written shim source for real bodies vs. `GasPNotImplementedError` throws, your newly-implemented method drops out of the generated stub file automatically. Run `npm run generate:stubs:check` before opening a PR to confirm the checked-in stubs match — it exits non-zero if `@types/google-apps-script` has moved on and stubs are stale, or if a real implementation didn't get regenerated out of the stub file. (There's no CI pipeline wired up yet to run this automatically — it's a manual step for now.)
4. **Write a test.** Follow the existing fixture-file convention (see [Testing](#testing) above): add a case to the matching `src/__tests__/<Service>.test.ts` that exercises the method through the public shim interface, not the generator internals.

The generator itself lives in `src/generator/` (`methodSurface.ts` reads the real `.d.ts` interfaces, `implementedMethods.ts` detects what's already real, `stubSource.ts` renders the stub file, `runGenerator.ts` wires them together per `stubTargets.ts`). You shouldn't need to touch it unless you're adding a new service to the generated surface — see `stubTargets.ts` for how existing services are configured.
