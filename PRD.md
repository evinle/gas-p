# gas-p — Product Requirements Document

## Problem Statement

Developers building Google Apps Script (GAS) web apps — a `Code.gs` backend plus an HTML/JS frontend calling `google.script.run` — cannot run or hot-reload that app locally. Every change requires a deploy-to-test cycle. There is no actively maintained tool that runs the real frontend and backend together locally, backed by real Google API calls, with the same `google.script.run` call pattern the frontend already uses in production.

## Solution

`gas-p` is a local development server for standalone GAS web apps. Three layers, bridged over HTTP instead of GAS's postMessage:

1. **Transport Shim** — a `Proxy`-based drop-in for `google.script.run` on the client. Only active when `typeof google === "undefined"` (never in production). Turns `google.script.run.someFunction(...)` into a `fetch` POST to the local backend, with the same chainable `withSuccessHandler`/`withFailureHandler`/`withUserObject` API and the same prod-parity constraints (JSON-serializable args only, `undefined` → `null`, un-awaited Promise returns, stripped error shape).
2. **Runtime Harness** — executes the developer's real `.gs`/`.js` source in an isolated Node `vm` context, rebuilt fresh per request (no state persists across calls, matching Apps Script's per-execution model). Also evaluates `doGet(e)`'s returned `HtmlOutput` against the real HTML files, running single-file scriptlet templating (`<?= ?>`, `<?!= ?>`, `<?# ?>`).
3. **Service Layer** — GAS service calls (`CalendarApp`, etc.) resolve through Live mode: real Google API calls via `googleapis`, bridged synchronously via a subprocess-per-call (see below). Local/fixture mode and record/replay are deferred past v1.

The developer's GAS source stays completely untouched — no imports from gas-p, no `await`, no coupling. The frontend stays untouched too — it calls `google.script.run` exactly as in production.

## User Stories

1. As a GAS developer, I want to run my web app's frontend and backend locally with hot reload, so that I can iterate without deploying.
2. As a GAS developer, I want the frontend to keep calling `google.script.run` unmodified, so that local and prod code paths don't diverge.
3. As a GAS developer, I want my local run to call real Google APIs by default, so that I can trust the results match production behavior.
4. As a GAS developer, I want writes and reads to happen immediately, the moment my `.gs` code calls them, so local behavior matches real Apps Script instead of introducing local-only caching bugs.
5. As a GAS developer, I want `doGet` to serve my real HTML files with scriptlet templating evaluated, so my web app's landing page works locally.
6. As a GAS developer, I want a single `vite dev` command to run everything, so that I don't juggle separate frontend/backend processes.
7. As a GAS developer, I want to authenticate gas-p once (browser-based OAuth2, scopes read from `appsscript.json`) and have it persist at `~/.gas-p/credentials.json`, so I don't re-authenticate on every run.
8. As a GAS developer, I want gas-p to refuse to touch any Google resource ID I haven't explicitly declared as a dev resource, so a copy-pasted production calendar/spreadsheet ID can't get silently mutated during local dev.
9. As a GAS developer, I want `PropertiesService` backed by a local `gas-p.properties.json` file (seeded via `gas-p pull-properties`), so I don't need a deployed script round-trip just to read/write script properties locally.
10. As a GAS developer, I want a clear `GasPNotImplementedError` when I call an unimplemented or container-bound GAS method, so I know exactly what's missing and that container-bound APIs (`getActive*`, `getUi`, container triggers) are out of scope by design.
11. As a GAS open source contributor, I want core (`dispatch.js`, `context.js`, `services.js`, `watcher.js`) to stay framework-agnostic, so new adapters beyond Vite are cheap to add later.
12. As a GAS developer, I want gas-p to work on Node 22+, so I can use modern Node features without polyfills.

## Scope

**In scope:** standalone Apps Script web apps (`doGet`/`doPost`) and API executables, with services accessed by explicit ID (`openById`, `getCalendarById`, ...).

**Out of scope:** container-bound scripts — `getActive*()`, `getUi()`/custom menus/dialogs/sidebars, container simple triggers (`onEdit`, `onSelectionChange`). Calling a container-bound API locally throws a clear "container-bound APIs are out of scope — use openById()" error, not a generic `undefined is not a function`.

## Implementation Decisions

### Package structure
- Single npm package, name `gas-p` (not a monorepo — no `packages/` split until a second package actually exists).
- Framework-agnostic core (`src/core/`) consumed by thin adapters (`src/adapters/`): `context.js` (builds the `vm` sandbox), `dispatch.js` (pure: context + fn name + args in, `{status, body}` out — no HTTP/framework awareness), `services.js` (Live-mode dispatch + subprocess bridge), `watcher.js` (wraps `chokidar`, emits reload events).
- v1 ships the **Vite plugin adapter only** (`configureServer()`, mounts the RPC handler on Vite's middleware, pushes reload events over Vite's existing WS channel — same-origin, no CORS, single `vite dev` command). The standalone Express adapter is deferred; core's adapter-agnostic design keeps it cheap to add later.

### Service Layer modes
- Two modes exist in the design (`mode: "local" | "live"` is in the v1 config schema for forward compatibility), but **v1 implements Live mode only**. Local/fixture mode, matcher functions, and `--record` capture are deferred past v1.
- **Live mode defaults on** with no config needed — matches the existing goal that local runs call real Google APIs so results match production.
- **Write/read semantics are immediate, per-call**, not batched or cached. There is no generic Write Queue or Resource Cache in core — see [ADR 0001](docs/adr/0001-immediate-live-semantics-no-write-queue.md). Sheets is the one service permitted its own internal batching to mirror real Apps Script's auto-flush behavior.
- **Sync-over-async bridge:** a synchronous subprocess call per service invocation (spawn a fresh Node process, run the async `googleapis` request inside it, return JSON over stdout). Validated by a working `CalendarApp` prototype. Per-call spawn overhead is accepted for v1 as a dev-loop cost — see [ADR 0002](docs/adr/0002-sync-over-async-subprocess-bridge.md).
- **Resource-ID allowlist:** dev resource IDs (calendar IDs, spreadsheet IDs, etc.) must be declared in config. `openById()`/`getCalendarById()`/equivalents throw before any API call if the ID isn't in that allowlist — see [ADR 0003](docs/adr/0003-live-mode-resource-id-allowlist.md).

### Services in v1
- `CalendarApp` — backed by Google Calendar API v3, prototyped and validated.
- `UrlFetchApp` — backed by native Node `fetch`.
- `Logger` — `.log()` writes to stdout.
- **Fast-follow after v1** (not launch-blocking): `PropertiesService`, then `SpreadsheetApp` (Sheets is the largest per-service effort due to its imperative + auto-flush semantics vs. REST batching).

### PropertiesService — the one local-file exception
- Unlike other services, `PropertiesService` stays backed by a local `gas-p.properties.json` file rather than routing through Live mode's real-API pass-through. Script properties are only reachable via the Apps Script REST API, which requires a deployed script — routing every property read/write through that would defeat the local dev loop.
- `gas-p pull-properties` fetches the deployed script's properties via the Apps Script REST API and writes them to `gas-p.properties.json`. Gitignored by default; gas-p offers to add it to `.gitignore` on first run.
- `getScriptProperties()` supported; `getUserProperties()`/`getDocumentProperties()` throw `GasPNotImplementedError`.

### HTML templating
- The Runtime Harness calls the user's real `doGet(e)` and evaluates the returned `HtmlOutput` against the real HTML files via a mock `HtmlService`, running single-file scriptlet templating (`<?= ?>`, `<?!= ?>`, `<?# ?>`).
- Multi-file includes (`HtmlService.createHtmlOutputFromFile('partial').getContent()` stitched into another template) are deferred past v1 — budget the templating engine as a small one, not a full include-resolving system.

### Authentication
- Unchanged from the prior design: gas-p owns its own OAuth2 client, separate from clasp. `gas-p auth` reads OAuth scopes from `appsscript.json` and runs a browser-based consent flow. Credentials stored at `~/.gas-p/credentials.json` (per-user, never committed). `googleapis` handles token refresh.
- Service account auth is a later addition for CI use cases, not a v1 requirement.

### Config schema (v1)
- `srcDir` — where the real `.gs`/`.js` source lives.
- `entryFunctions` — declared local-runnable entry points.
- `mode` — `"local" | "live"`, included now for forward compatibility, always `"live"` in v1 since Local mode doesn't exist yet.
- `devResourceIds` — the allowlist of Google resource IDs Live mode is permitted to touch.
- `port` — dev server port.
- `fixtures` — **not** in the v1 schema; added when Local mode ships.

### Stub generation
- The full GAS API surface is code-generated as stubs from `@types/google-apps-script`. Unimplemented methods throw `GasPNotImplementedError` with the method name and a link to the gas-p GitHub issues page.

### Open source
- MIT license, public GitHub repo from day one.

## Known Prod/Dev Parity Gaps (document for end users)

- Transport is HTTP request/response locally vs. postMessage into a sandboxed iframe in prod — timing and payload-size behavior (~50MB one-way cap with Apps Script's own serialization overhead) won't perfectly match.
- Promise-returning server functions: prod's failure to properly await them is intentionally replicated, not fixed.
- Live mode is subject to real latency (including subprocess spawn overhead per call) and real Google API quota limits.
- Container-bound APIs are out of scope entirely (see Scope).
- No Local/fixture mode in v1 — every run needs real credentials and real (allowlisted) dev resources; no offline or credential-free CI path yet.

## Out of Scope (v1)

- Local/fixture mode, matcher functions, `--record` capture, fixture file format.
- Standalone Express adapter (CORS/proxy guidance for non-Vite users).
- `SpreadsheetApp`, `GmailApp`, `FormApp`, `SlidesApp`, `DocumentApp`, `DriveApp` — deferred to future versions.
- Multi-file HTML template includes.
- Bound scripts (scripts attached to a Google Sheet, Doc, or Form container) and all container-bound APIs.
- Full fidelity emulation — gas-p is a development aid, not a complete GAS emulator.
- Support for Node versions below 22.
- Global npm installation — local dev dependency only.

## Testing Decisions

(Carried over from the prior design; conventions are orthogonal to the architecture pivot.)

- Tests exercise external behavior — what a shim returns or what side effects it produces — not internal implementation details.
- Each service shim: verify implemented methods return correctly shaped GAS objects given mocked `googleapis` responses (`vitest`, no real API calls in tests).
- `GasPNotImplementedError`: verify stub methods throw with the correct message format including the GitHub issues link.
- Auth module: verify `appsscript.json` scopes are read correctly and the OAuth client is constructed with the right parameters.
- New for this architecture: Transport Shim (client-side `Proxy` behavior, chainable API, error reshaping), Runtime Harness (`vm` context rebuild per request, `doGet`/`HtmlOutput` scriptlet evaluation), the subprocess sync-over-async bridge (mock `child_process`), and the Vite adapter's `configureServer()` wiring.
- Fixture files for known-good inputs live in `src/__tests__/__fixtures__/`; inline `fs.writeFileSync` only for malformed/error-case inputs.

## Further Notes

- Future versions may explore Local/fixture mode + record/replay once Live mode is proven out, and a standalone Express adapter for non-Vite users.
- The `gas-p pull-properties` command requires the Apps Script REST API to be enabled in the user's Google Cloud project — same requirement as clasp.
