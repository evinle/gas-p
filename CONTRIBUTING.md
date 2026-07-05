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

Weigh every parameter added to a function signature — each one is a coupling point every call site has to get right, in order, forever. Once a signature reaches 3 parameters, that's a signal to consider grouping the related ones into a single object/interface that names the concept (e.g. `SandboxBuildParams` in `context.ts`), rather than continuing to add positional params. This isn't a hard cutoff — three same-typed, order-sensitive params (`(srcDir, htmlDir, sandbox)`) is worse than three self-evident ones, and a well-named object of two params can already be worth it. Optimize for what a call site reads like, not the count.

## Reporting a missing method or a bug

`gas-p` implements GAS global services (`CalendarApp`, `UrlFetchApp`, ...) incrementally — an unimplemented method throws `GasPNotImplementedError`. Use the **Missing method / feature request** issue template to ask for one, or **Bug report** if something behaves differently than real Apps Script.

## Filling in a stub

Every method on the real `@types/google-apps-script` surface exists somewhere in `src/shims/` — either as a real implementation, or as a generated stub that throws `GasPNotImplementedError`.

1. **Find the stub.** Generated stubs live in `src/shims/generated/<Interface>.stubs.ts`, one abstract class per GAS interface (e.g. `CacheServiceStubs` in `CacheService.stubs.ts` for the `CacheService` singleton, `CacheStubs` in `Cache.stubs.ts` for the object it returns from `getScriptCache()`). Search for the method name there, or just call it and read the `GasPNotImplementedError` message — it names the interface and method directly.
2. **Check the real behavior — don't infer it from the type signature.** `@types/google-apps-script` only gives you argument/return *types*; it says nothing about defaults, edge cases, or side effects (e.g. what charset `Blob.getDataAsString()` defaults to, or what happens on an empty input). Look up the method on Google's official reference (`https://developers.google.com/apps-script/reference/...`) before writing the implementation, and add a one-line comment citing the doc's own wording wherever the behavior isn't obvious from the code, e.g.:
   ```ts
   // "Gets the data of this blob as a String with UTF-8 encoding." — Blob docs
   getDataAsString(): string {
     return Buffer.from(this.bytes).toString('utf-8');
   }
   ```

   If the official reference doesn't specify the behavior you need either (defaults it's silent on, or an internal representation it only describes vaguely — e.g. `HtmlTemplate.getCode()`'s generated-JS format), don't guess. Escalate to checking against a real Apps Script execution instead: write a small script exercising the method, run it in the Apps Script editor, and log the result. If even that can't establish behavior stable and precise enough to implement with confidence (undocumented formatting with no specified grammar, apparent bugs you'd have to replicate rather than fix, single-sample results you can't generalize from), it's fine to leave the method as a stub — just document *why* in an ADR (see [`docs/adr/0005-htmltemplate-getcode-left-unimplemented.md`](docs/adr/0005-htmltemplate-getcode-left-unimplemented.md) for a worked example) rather than shipping a plausible-looking guess nobody can verify.
3. **Replace it with a real implementation.** The hand-written shim module for that service (e.g. `src/shims/CacheService.ts`) declares a class of the *exact same name* as the interface, `extend`ing the generated abstract stub class, and overrides individual methods as real class methods:

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
4. **Regenerate.** Run `npm run generate:stubs` after your change. Because the generator scans the hand-written shim source for real method bodies vs. `GasPNotImplementedError` throws, your newly-implemented method drops out of the generated stub class automatically. Run `npm run generate:stubs:check` before opening a PR to confirm the checked-in stubs match — it exits non-zero if `@types/google-apps-script` has moved on and stubs are stale, or if a real implementation didn't get regenerated out of the stub file. (There's no CI pipeline wired up yet to run this automatically — it's a manual step for now.)
5. **Write a test.** Follow the existing fixture-file convention (see [Testing](#testing) above): add a case to the matching `src/__tests__/<Service>.test.ts` that exercises the method through the public shim interface, not the generator internals.

The generator itself lives in `src/generator/` (`methodSurface.ts` reads the real `.d.ts` interfaces, `implementedMethods.ts` detects what's already real by finding the matching class declaration, `stubSource.ts` renders the abstract stub class, `runGenerator.ts` wires them together per `stubTargets.ts`). You shouldn't need to touch it unless you're adding a new service to the generated surface — see `stubTargets.ts` for how existing services are configured (just `typesFile`/`qualifiedInterfaceName`/`outputName`/`existingShimFile`, no per-target overrides needed).

## Adding a whole new service

`gas-p` implements only a subset of GAS's global services (`CalendarApp`, `Utilities`, ...) — `@types/google-apps-script` declares many more with no shim at all yet (`SpreadsheetApp`, `DriveApp`, `GmailApp`, `FormApp`, ...; see the `google-apps-script.*.d.ts` files for the full list of `declare var X: ...` entry points). This is different from [Filling in a stub](#filling-in-a-stub) above, which covers a method on a service that's already at least partially shimmed.

1. **Add an entry to `stubTargets.ts`.** Find the service's `.d.ts` file and its qualified interface name (e.g. `GoogleAppsScript.Spreadsheet.SpreadsheetApp`), and add a target with an `existingShimFile` pointing at where its hand-written shim should live (e.g. `shims/SpreadsheetApp.ts`) — that file doesn't need to exist yet.
2. **Run `npm run generate:stubs`.** Because the target's `existingShimFile` doesn't exist on disk, the generator scaffolds *both* files for you: the generated abstract stub class (`src/shims/generated/SpreadsheetApp.stubs.ts`), and the hand-written shim itself (`src/shims/SpreadsheetApp.ts`), pre-wired as a ready-to-use singleton:

   ```ts
   import { SpreadsheetAppStubs } from './generated/SpreadsheetApp.stubs.js';

   class SpreadsheetApp extends SpreadsheetAppStubs {}

   const instance = new SpreadsheetApp();
   export { instance as SpreadsheetApp };
   ```

   Every method on it throws `GasPNotImplementedError` until filled in per [Filling in a stub](#filling-in-a-stub). The generator never overwrites this file once it exists — re-running `generate:stubs` after this point behaves exactly as it does for any other service.

   If the service needs config only known at harness startup (credentials, `srcDir`, ...) rather than a bare singleton, change the shim to export the class itself instead — see the config patterns under [Filling in a stub](#filling-in-a-stub) step 3.
3. **Wire it into the runtime sandbox.** Import the shim in `src/core/context.ts` and assign it onto `sandbox` inside `createSandbox`, so `.gs`/`.js` source can actually reach it as a global. Follow the existing pattern for services that touch real Google resources: gate construction behind `services` and (if the service can mutate/read a specific resource by ID) thread through `services.devResourceIds`, the same way `CalendarApp` is gated — see [ADR 0001](docs/adr/0001-immediate-live-semantics-no-write-queue.md) for why resource-touching services need this.
4. **Write a test.** Same convention as step 5 of [Filling in a stub](#filling-in-a-stub).
