# gas-p — Product Requirements Document

## Problem Statement

Developers writing Google Apps Script (GAS) in TypeScript cannot test or run their code locally. The GAS runtime executes exclusively on Google's servers, meaning every change requires a full deploy via clasp before it can be exercised. This makes iteration slow, debugging painful, and automated testing effectively impossible without mocking the entire GAS global surface by hand. There is no actively maintained, TypeScript-first tool that provides a local GAS runtime backed by real Google API calls.

## Solution

`gas-p` is a local development runtime for Google Apps Script TypeScript codebases. It injects shims for GAS global services (`SpreadsheetApp`, `CalendarApp`, `UrlFetchApp`, `PropertiesService`, `Logger`) into a Node.js execution context, backed by real Google API calls via the `googleapis` package. The developer's GAS source code remains completely untouched — no imports, no modifications, no coupling to gas-p. A thin local-only entry point wraps execution via `gas-p.run()`. The tool is open source, MIT licensed, and designed to be shared across the GAS developer community.

## User Stories

1. As a GAS developer, I want to run my TypeScript GAS code locally without deploying, so that I can iterate faster.
2. As a GAS developer, I want my local run to call real Google APIs, so that I can trust the results match production behaviour.
3. As a GAS developer, I want to authenticate gas-p once and have it persist, so that I don't re-authenticate on every run.
4. As a GAS developer, I want gas-p to read the required OAuth scopes from my existing `appsscript.json`, so that I don't have to declare them twice.
5. As a GAS developer, I want my GAS source code to stay untouched, so that it can still be deployed to Google without modification.
6. As a GAS developer, I want a thin local entry point that wraps my function calls, so that I have a clear separation between GAS source and local dev tooling.
7. As a GAS developer, I want `SpreadsheetApp` to work locally backed by the real Sheets API, so that I can test spreadsheet logic without deploying.
8. As a GAS developer, I want `CalendarApp` to work locally backed by the real Calendar API, so that I can test calendar logic without deploying.
9. As a GAS developer, I want `UrlFetchApp` to work locally using native Node fetch, so that my HTTP calls behave the same as in production.
10. As a GAS developer, I want `PropertiesService` to work locally backed by a `gas-p.properties.json` file, so that I can replicate script properties without hardcoding secrets.
11. As a GAS developer, I want to run `gas-p pull-properties` to seed my local properties file from the deployed script, so that my local environment matches production exactly.
12. As a GAS developer, I want `gas-p.properties.json` to be gitignored by default, so that secrets are not accidentally committed.
13. As a GAS developer, I want `Logger.log()` to output to the terminal, so that I can see logs during local execution.
14. As a GAS developer, I want a clear `GasPNotImplementedError` when I call an unimplemented GAS method, so that I know exactly what's missing and where to request it.
15. As a GAS developer, I want the `GasPNotImplementedError` to include a link to the GitHub issues page, so that I can easily request or contribute the missing method.
16. As a GAS developer, I want gas-p to be a local dev dependency (`npm install -D gas-p`), so that the version is pinned per project and reproducible across my team.
17. As a GAS developer, I want to run gas-p via `npx gas-p run local/run.ts`, so that no global install is required.
18. As a GAS developer, I want zero TypeScript configuration for gas-p, so that I can get started without tsconfig changes.
19. As a GAS developer, I want `gas-p.run()` to flush all queued write operations at the end of execution, so that writes are applied after all logic has run.
20. As a GAS developer, I want resources like spreadsheets to be fetched and cached eagerly on first access, so that subsequent method calls on the same resource are fast and synchronous.
21. As a GAS open source contributor, I want a clear pattern for implementing unimplemented stubs, so that I can contribute a new method without understanding the entire codebase.
22. As a GAS developer, I want only standalone scripts to be supported, so that I don't have to configure a "container" document.
23. As a GAS developer on a team, I want gas-p credentials stored in `~/.gas-p/credentials.json`, so that auth is per-user and not committed to the repo.
24. As a GAS developer, I want gas-p to work on Node 22+, so that I can use modern Node features without polyfills.

## Implementation Decisions

### Package name and distribution
- Package name: `gas-p`, published to npm as a local dev dependency.
- CLI invoked via `npx gas-p <command>` or via `package.json` scripts.
- Minimum Node version: 22.

### User interface model
- GAS source files remain completely unmodified — no imports from gas-p, no `await`, no changes.
- Users create a local-only entry point (e.g., `local/run.ts`) that is excluded from clasp deployment via `.clasp.json` `rootDir` scoping.
- The entry point calls `gas-p.run(() => myFunction())`, which sets up the GAS global scope, executes the function, and flushes the write queue on completion.
- `tsx` is bundled as a dependency and used to execute TypeScript entry points with zero tsconfig configuration required from the user.

### Standalone-only scope
- Bound scripts (scripts attached to a Google Sheet/Doc/Form) are out of scope. `SpreadsheetApp.getActiveSpreadsheet()` and similar "active container" methods will throw `GasPNotImplementedError`.
- All resource access must use explicit IDs (e.g., `SpreadsheetApp.openById('...')`).

### Authentication
- gas-p owns its own OAuth2 client, separate from clasp.
- On `gas-p auth`, gas-p reads the OAuth scopes declared in the project's `appsscript.json` manifest and initiates a browser-based OAuth2 consent flow requesting exactly those scopes.
- Credentials are stored at `~/.gas-p/credentials.json` (per-user, never committed).
- The `googleapis` Node client handles token refresh automatically.

### Stub generation strategy
- The full GAS API surface is code-generated as stubs from `@types/google-apps-script`.
- Every unimplemented method throws `GasPNotImplementedError` with the method name and a link to the gas-p GitHub issues page.
- Real implementations are filled in progressively. This makes the implementation roadmap explicit and contributions straightforward.

### Resource caching and async resolution
- GAS is synchronous; `googleapis` is async. This mismatch is resolved via eager caching.
- When a resource is first opened (e.g., `SpreadsheetApp.openById('abc')`), gas-p fetches the full resource from the Google API and caches it in memory.
- All subsequent method calls on that resource (e.g., `getSheetByName`, `getRange`, `getValues`) operate synchronously on the cached data.
- Write operations (e.g., `setValue`, `appendRow`) are queued in a Write Queue.
- At the end of `gas-p.run()`, the Write Queue is flushed — all pending writes are applied to Google's APIs in sequence.
- This mirrors how GAS itself batches writes and keeps user code synchronous.

### Services in v1
- `SpreadsheetApp` — backed by Google Sheets API v4
- `CalendarApp` — backed by Google Calendar API v3
- `UrlFetchApp` — backed by native Node `fetch`; returns an `HTTPResponse` shim with `.getContentText()`, `.getResponseCode()`, `.getHeaders()`; supports `muteHttpExceptions`; `fetchAll()` implemented via `Promise.all`
- `PropertiesService` — backed by `gas-p.properties.json`; `getScriptProperties()` supported; `getUserProperties()` and `getDocumentProperties()` throw `GasPNotImplementedError`
- `Logger` — `.log()` writes to stdout

### PropertiesService local storage
- Script properties are stored in `gas-p.properties.json` at the project root.
- The file is gitignored by default; gas-p warns and offers to add it to `.gitignore` on first `pull-properties` run.
- `gas-p pull-properties` fetches the deployed script's properties via the Apps Script REST API and writes them to `gas-p.properties.json`.
- No `.env` file support — `gas-p.properties.json` is the single source of truth for local properties.

### Error class
- `GasPNotImplementedError` extends `Error`.
- Message format: `"{ServiceName}.{methodName}() is not yet implemented in gas-p. 👉 Request it or contribute: https://github.com/{owner}/gas-p/issues"`

### Open source
- MIT license.
- Public GitHub repository from day one.
- `CONTRIBUTING.md` documents the stub-filling pattern so contributors can add a method in isolation.

## Testing Decisions

### What makes a good test
- Tests should exercise external behaviour — what the shim returns or what side effects it produces — not internal implementation details like how the cache is structured or how the write queue is iterated.
- Tests should verify that a shim method returns the correct GAS-shaped response given a known API response, and that write operations are forwarded to the correct `googleapis` call with the correct parameters.

### Modules to test
- **Auth module**: verify that `appsscript.json` scopes are read correctly and that the OAuth client is constructed with the right parameters.
- **Each service shim**: verify that implemented methods return correctly shaped GAS objects given mocked `googleapis` responses. Use `vitest` with mocked `googleapis` clients — do not make real API calls in tests.
- **Write Queue**: verify that queued operations are flushed in order and that flush is called at the end of `gas-p.run()`.
- **Resource Cache**: verify that a resource is fetched exactly once even when accessed multiple times within a single `run()` invocation.
- **`GasPNotImplementedError`**: verify that stub methods throw with the correct message format including the GitHub issues link.
- **`UrlFetchApp`**: verify `HTTPResponse` shim methods against mocked `fetch` responses; verify `muteHttpExceptions` behaviour; verify `fetchAll` fires requests in parallel.
- **`PropertiesService`**: verify reads from `gas-p.properties.json`; verify `pull-properties` writes the correct file structure.

### Prior art
- No existing codebase — this is a greenfield project. Establish `vitest` as the test runner from the start. Tests live alongside source in a `__tests__` directory per module.

## Out of Scope

- Bound scripts (scripts attached to a Google Sheet, Doc, or Form container).
- `GmailApp`, `FormApp`, `SlidesApp`, `DocumentApp`, `DriveApp` — deferred to future versions.
- `getUserProperties()` and `getDocumentProperties()` on `PropertiesService`.
- Full fidelity emulation — gas-p is a development aid, not a complete GAS emulator.
- Running GAS scripts that depend on GAS-specific features with no Node equivalent (e.g., `HtmlService`, triggers, time-based execution).
- A Vite plugin or any build-time transformation of user source code.
- Support for Node versions below 22.
- Global npm installation — local dev dependency only.

## Further Notes

- The eager caching strategy means that if a script conditionally accesses a resource (only opens a spreadsheet in one code branch), it is still fetched upfront when that branch is entered. This is an acceptable v1 trade-off.
- The `local/` directory convention (excluded from clasp via `rootDir`) is the recommended pattern but not enforced — users can organise their entry points however they like as long as they stay outside the clasp `rootDir`.
- The `gas-p pull-properties` command requires the Apps Script REST API to be enabled in the user's Google Cloud project — the same requirement as clasp. Users with clasp already configured should have no additional setup.
- Future versions may explore a watch mode (`gas-p watch local/run.ts`) that re-runs on file change for a tighter feedback loop.
