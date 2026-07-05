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

1. **Find the stub.** Generated stubs live in `src/shims/generated/<Interface>.stubs.ts`, one abstract class per GAS interface (e.g. `CacheServiceStubs` in `CacheService.stubs.ts` for the `CacheService` singleton, `CacheStubs` in `Cache.stubs.ts` for the object it returns from `getScriptCache()`). Search for the method name there, or just call it and read the `GasPNotImplementedError` message — it names the interface and method directly.
2. **Replace it with a real implementation.** The hand-written shim module for that service (e.g. `src/shims/CacheService.ts`) declares a class of the *exact same name* as the interface, `extend`ing the generated abstract stub class, and overrides individual methods as real class methods:

   ```ts
   import { CacheServiceStubs } from './generated/CacheService.stubs.js';

   class CacheService extends CacheServiceStubs {
     getUserCache() {
       /* real implementation */
     }
   }
   ```

   Any method you don't override is inherited from `CacheServiceStubs` and still throws `GasPNotImplementedError` — do **not** edit the generated `*.stubs.ts` file directly, it will be overwritten.

   The class name matters: the generator finds "what's already implemented" by scanning the shim file for a class declaration whose name exactly matches the interface (e.g. `CacheService`, `Calendar`, `HtmlOutput`) and reading its own methods — no `create<Scope>` factory naming, no config needed.

   - If the service needs no per-context config (e.g. `Utilities`, `CacheService`), construct a single instance and re-export it under the class's own name so callers still get a ready-to-use object, not a class to `new` themselves:
     ```ts
     const instance = new CacheService();
     export { instance as CacheService };
     ```
   - If the service needs config only known at harness startup (e.g. `CalendarApp`, `Session`, credentials/`srcDir`/`vm.Context`), export the class itself and construct it with `new` at its one call site in `src/core/context.ts` — no factory function needed.
   - If the interface represents many simultaneous instances (e.g. `Calendar`, `CalendarEvent`, one per calendar/event), just `new` it wherever it's created — inside another class's method, typically — same as any other class.
3. **Regenerate.** Run `npm run generate:stubs` after your change. Because the generator scans the hand-written shim source for real method bodies vs. `GasPNotImplementedError` throws, your newly-implemented method drops out of the generated stub class automatically. Run `npm run generate:stubs:check` before opening a PR to confirm the checked-in stubs match — it exits non-zero if `@types/google-apps-script` has moved on and stubs are stale, or if a real implementation didn't get regenerated out of the stub file. (There's no CI pipeline wired up yet to run this automatically — it's a manual step for now.)
4. **Write a test.** Follow the existing fixture-file convention (see [Testing](#testing) above): add a case to the matching `src/__tests__/<Service>.test.ts` that exercises the method through the public shim interface, not the generator internals.

The generator itself lives in `src/generator/` (`methodSurface.ts` reads the real `.d.ts` interfaces, `implementedMethods.ts` detects what's already real by finding the matching class declaration, `stubSource.ts` renders the abstract stub class, `runGenerator.ts` wires them together per `stubTargets.ts`). You shouldn't need to touch it unless you're adding a new service to the generated surface — see `stubTargets.ts` for how existing services are configured (just `typesFile`/`qualifiedInterfaceName`/`outputName`/`existingShimFile`, no per-target overrides needed).
