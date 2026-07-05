# gas-p — Domain Glossary

## GAS Source
TypeScript files written to run on the Google Apps Script runtime. GAS Source is deployed to Google via clasp and must not import from gas-p or contain any Node-specific code.

## Runtime Harness
The server-side component that executes the developer's real `.gs`/`.js` source files in an isolated Node `vm` context with a controlled global set (GAS services as sandbox globals). Rebuilt fresh per incoming request, matching Apps Script's per-execution model — no module-level state persists across calls.

## Transport Shim
The client-side, `Proxy`-based drop-in for `google.script.run`. Only active when `typeof google === "undefined"` (i.e. never in production). Turns non-chain property access into a server function name, POSTs it to the local backend, and routes the response to the registered success/failure handler.

## Service Layer
The interception point where GAS service calls (`CalendarApp`, `SpreadsheetApp`, ...) resolve to either Local mode (fixture lookup) or Live mode (real API pass-through), selected via config.

## Local mode
A Service Layer mode that answers GAS service calls from a Declared Fixture instead of calling real Google APIs. Synchronous by nature since it's just a lookup.

## Declared Fixture
A hand-written, per-project override for a GAS service method's return value, supplied by the consumer (as opposed to any future mechanism that might auto-capture real API responses). Declared in `gas-p.fixtures.ts`, keyed by service name like `devResourceIds`, and read fresh on every request rather than cached — so editing fixtures never requires a dev-server restart, the same guarantee `.gs`/`.js` source edits already get. A fixture's value is either a static return value or a function of the real method's own argument list; either form must be synchronous, since it runs inside the same synchronous `vm.Context` as GAS source itself.

## Live mode
A Service Layer mode that translates GAS service calls to real Google API calls via `googleapis`, bridged synchronously via a subprocess (see Sync-Over-Async Bridge). Every call — read or write — is an immediate, live round-trip; there is no cross-call caching or write batching in core. (Sheets is the one service permitted its own internal batching to mirror real Apps Script's auto-flush behavior — see `SpreadsheetApp.flush()` parity note.)

## Sync-Over-Async Bridge
The mechanism that lets synchronous GAS-style code call the promise-based `googleapis` client without `await`. Implemented as a synchronous subprocess call (`execFileSync` spawning a fresh Node process per call that runs the async request and returns JSON over stdout) — validated by the working Calendar prototype.

## Shim
A Node.js implementation of a GAS global service (e.g., `SpreadsheetApp`, `CalendarApp`) that exposes the same interface as the real GAS service, backed by real Google API calls via the `googleapis` package.

## Stub
An unimplemented shim method generated from `@types/google-apps-script` that throws `GasPNotImplementedError` when called. Stubs represent the implementation backlog.

## GasPNotImplementedError
A custom error thrown by any Stub method. Includes the fully-qualified method name and a link to the gas-p GitHub issues page so developers can request or contribute the missing implementation.

## Pull Properties
The `gas-p pull-properties` CLI command that fetches the deployed script's properties from the Apps Script REST API and writes them to `gas-p.properties.json`.

## gas-p.properties.json
A local file at the project root that backs `PropertiesService.getScriptProperties()` during local execution. Mirrors the structure of the deployed script's property store. Gitignored by default.

## Standalone Script
A GAS script that lives at script.google.com and is not attached to a Google Workspace document. gas-p supports standalone scripts only. All resource access must use explicit IDs.

## Bound Script
A GAS script created from inside a Google Sheet, Doc, or Form that has implicit access to the "container" document via methods like `getActiveSpreadsheet()`. Out of scope for gas-p.

## appsscript.json
The GAS project manifest file managed by clasp. gas-p reads the `oauthScopes` field from this file during `gas-p auth` to determine which Google API scopes to request.
