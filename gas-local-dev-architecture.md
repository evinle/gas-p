# GAS Local Dev — Architecture Handoff (v2)

## Purpose

An open-source package that lets developers run **standalone** Google Apps
Script projects (`Code.gs` + HTML frontend) locally during development, with
real hot reload, instead of the deploy-to-test cycle. The frontend keeps
calling `google.script.run.someFunction()` exactly as in production; locally,
those calls are transparently redirected to a local server that executes the
developer's *actual* `Code.gs` source.

## Scope

**In scope:** standalone Apps Script projects — web apps (`doGet`/`doPost`)
and API executables, with services accessed by explicit ID
(`openById`, `getCalendarById`, ...).

**Out of scope:** container-bound scripts and everything that implies —
`getActive*()` methods, `getUi()` / custom menus / dialogs / sidebars, and
container simple triggers (`onEdit`, `onSelectionChange`). When user code
calls a container-bound API locally, the service layer throws a clear
"container-bound APIs are out of scope — use openById()" error rather than a
generic `undefined is not a function`. This scope statement leads the docs,
not just the parity-gap appendix.

## Core Insight

Apps Script is two runtimes bridged by `google.script.run` (postMessage RPC,
not HTTP). Locally we simulate the same split, bridged over HTTP. Three
independent layers:

1. **Transport shim** — client-side replacement for `google.script.run`
2. **Runtime harness** — server-side execution of the real `.gs` files
3. **Service layer** — one live implementation + a generic stub/fixture
   engine in front of it (not per-service reimplementations)

---

## 1. Transport Shim (Client Side)

`Proxy`-based drop-in for `google.script.run` with the same chainable API
(`withSuccessHandler`, `withFailureHandler`, `withUserObject`, then a
function call). Non-chain property access is treated as a server function
name → `fetch` POST to the local backend, response routed to the registered
handler. Only active when `typeof google === "undefined"`; in production the
real object exists and the shim never loads.

**Prod-parity constraints (replicate, don't fix):**
- Async / non-blocking calls, JSON-serializable args/returns only;
  `undefined` → `null` coercion, unsupported types stripped.
- Promise-returning server functions are *not* properly awaited in real Apps
  Script — replicated locally so dev doesn't teach a wrong mental model.
- Errors reaching `withFailureHandler` reshaped to Apps Script's stripped
  format (message only, no full stack).

---

## 2. Runtime Harness (Server Side)

Node's built-in `vm` module executes the real `.gs`/`.js` sources in an
isolated V8 context with a controlled global set:

```js
const sandbox = { console, SpreadsheetApp, CalendarApp, ... };
vm.createContext(sandbox);
vm.runInContext(fileContents, sandbox, { filename });
```

- Unknown globals throw `ReferenceError` — same failure mode as real Apps
  Script.
- Not a security sandbox; acceptable since it only runs the developer's own
  trusted code.
- Multiple `.gs` files flatten into one global scope, matching Apps Script.
- **Context rebuilt per request** (not just per file change) to match Apps
  Script's per-execution model: no module-level state persists across calls.
- **HTML serving:** the harness calls the user's real `doGet(e)` and
  evaluates the returned `HtmlOutput`, so `HtmlService` scriptlet templating
  (`<?= ?>`, `<?!= ?>`, `<?# ?>`) runs against the real HTML files via a mock
  `HtmlService`. (Note: this is a small templating engine of its own —
  budget it as such.)

### `.ts` source: bundle before execution (scope addition, #19)

`buildContext()` above only covers raw `.gs`/`.js` — no bundler runs anywhere
in that path. Real projects are authored as multi-file `.ts` with genuine
`import`s between files (already bundled today via Vite before `clasp push`),
which `vm.runInContext` cannot resolve on its own. A resolve/bundle step must
run ahead of execution for that case.

**Decision:** bundle via Vite's `build({ write: false })` API, reusing the
consumer's own resolved Vite config, then execute the resulting string in the
same isolated `vm` sandbox already used for `.gs`. Deliberately **not**
`ssrLoadModule` or the Environment API's Module Runner — both execute in real
Node module scope (ambient `process`/`require`/etc.), which would let dev
code silently use capabilities that don't exist in real Apps Script (a
dev/prod fidelity leak).

- **Entry-point config** — an explicit entry field (e.g. `entry` in
  `gas-p.config.ts`) rather than inferring source files from a directory
  scan; bundling needs one deterministic entry point.
- **Config passthrough** — seed the programmatic `build()` call from the
  consumer's own resolved Vite config (`server.config`: aliases, resolve
  options, other plugins) so the dev-time bundle resolves imports identically
  to the real `vite build` / `clasp push` artifact.
- **Output format: `cjs`, not `iife`/`esm`.** `iife` wraps the whole bundle in
  `(function(){...})()`, hiding top-level declarations from the sandbox
  (breaks `doGet` being visible as a literal global). `esm` keeps `export`
  statements that `vm.runInContext` can't execute (no module loader in a
  `vm` context). `cjs` keeps top-level declarations un-wrapped and only
  appends `module.exports.x = ...` lines for anything actually exported —
  stub `sandbox.module = { exports: {} }` before running so those lines
  don't throw.
- **Tree-shaking/minification will silently delete trigger functions unless
  disabled — verified empirically, not documented behavior.** Apps Script
  functions (`doGet`, `getGreeting`, ...) are implicit globals with no
  `export`; both Rollup's tree-shaker and Vite's default esbuild minifier
  treat an unreferenced, unexported top-level function as dead code and
  silently drop it. Reproduced with a real two-file `.ts` fixture: neither
  `build.minify: false` alone nor `rollupOptions.treeshake: false` alone was
  sufficient — **both** are required together, or `doGet` vanishes from the
  bundle with no error (surfaces later as a confusing `doGet is not defined`
  from the harness). Non-negotiable build options: `minify: false` and
  `rollupOptions.treeshake: false`.
- **Feed into the existing sandbox** — run the bundled string through the
  same `vm.runInContext(bundleString, sandbox)` `context.ts` already uses for
  `.gs`; the isolation/`ReferenceError` behavior itself doesn't change.
- **Bundle timing** — per-request bundling to start, for correctness;
  revisit caching + watcher-driven invalidation (#23) only if latency
  becomes a measured problem.
- **Chunk return shape** — `build({ write: false })`'s output array entries
  expose the bundled source on `.code` (confirmed against the pinned Vite
  version by direct probe, not just the docs, since `build.write`'s return
  shape isn't part of Vite's documented public API).

---

## 3. Service Layer

Two modes, same interception point, selectable via config
(`mode: "local" | "live"`):

### Local mode — fixture/stub engine (not reimplementation)

Local mode is a **lookup, not an implementation**. The user (or a recorded
fixture file) declares canned results: "when `CalendarApp.getEvents(...)` is
called, return this." Returning canned data is synchronous by nature, so the
sync/async problem does not exist in this mode.

- A generic auto-chaining `Proxy` provides the intermediate objects for
  fluent APIs (`openById(...).getSheetByName(...).getRange(...).getValue()`),
  consulting the fixture map at the leaves — one mechanism in core, no
  per-service code.
- v1 matching: method-level stubs, with an optional matcher function for
  argument-sensitive cases. (Deep argument matching — Dates, ordering — is
  deferred.)
- **Record/replay:** live mode already wraps every service call, so a
  `--record` flag captures real responses into fixture files. Run once
  against real APIs, iterate offline. This makes fixtures optional to write
  and gives deterministic CI without credentials.
- Known tradeoff: fixtures can't catch failures that only occur against real
  APIs (bad args, permissions, shape drift) — same tradeoff as any HTTP
  mocking library; documented in parity gaps.

### Live mode — real API pass-through

Wrappers around the `googleapis` Node client (service account or OAuth) that
translate Apps Script service calls to REST calls. With `getActive*` out of
scope, everything is ID-addressed, which maps cleanly onto REST.

- **Key open risk — sync-over-async:** Apps Script service calls are
  synchronous; `googleapis` is promise-based, and user `.gs` code correctly
  does not await. The bridge must present a synchronous facade over async
  API calls (e.g. worker thread + `Atomics.wait`, or a synchronous
  subprocess call). This is the hardest remaining engineering item and must
  be validated before committing further (verify the working Calendar
  prototype handles genuinely non-awaiting `.gs` code).
- Semantic translation is per-service work, not a uniform thin wrapper —
  Calendar is comparatively simple; Sheets (imperative + auto-flush vs.
  REST batching) is the worst case and should be scoped accordingly.
- Real data, real quotas: dev iterations mutate actual resources. Provide
  config for designated dev resource IDs and document loudly.
- Slower loop: every RPC includes a Google round trip; hot reload of code
  stays fast, interaction testing gets laggier.

---

## Package Structure — Core/Adapter Split

Framework-agnostic **core** consumed by thin, swappable **adapters**:

```
packages/gas-dev/
├── src/
│   ├── core/
│   │   ├── context.js      // buildContext(srcDir, globals) → vm sandbox
│   │   ├── dispatch.js     // handleRpcCall(context, fnName, args) → {status, body}
│   │   ├── services.js     // stub/fixture engine + live pass-through + record
│   │   └── watcher.js      // wraps chokidar, emits reload events
│   ├── adapters/
│   │   ├── vite-plugin.js  // configureServer() wiring around core/*
│   │   └── standalone.js   // Express server wiring around core/*
│   └── index.js
```

`core/dispatch.js` stays pure (no HTTP/framework awareness): context +
function name + args in, `{status, body}` out. Apps Script semantics
(`undefined` coercion, error shape, Promise behavior) are fixed once in core;
adapters inherit them. New adapters are cheap wrappers.

## Adapters

**Vite plugin (default):** hooks `configureServer(server)`, mounts the RPC
handler on Vite's middleware stack, pushes a `gas-dev:reload` event over
Vite's existing WS channel on `.gs` changes. Same-origin (no CORS), single
`vite dev` command. Tradeoff: shares the Vite process, so a runaway `Code.gs`
can take down the dev server — mitigated with call timeouts; standalone mode
is the isolation fallback.

The plugin serves two structurally different request types over that one
middleware stack — don't conflate them:

1. **Page load (`doGet`)** — a plain GET, fires once per navigation, returns
   `text/html`. The only channel that returns HTML.
2. **RPC (`google.script.run.fn()`)** — fires repeatedly *after* the page
   loads, POSTs to the RPC endpoint, returns serialized data, never HTML.
   (Implemented — see Transport Shim / core/dispatch.js above.)

**Page-load wiring (implemented):**

For the page-load channel, the plugin must serve complete HTML on every
request with no build artifact to serve from in watch mode — the same
problem Vite's own SSR dev mode solves. The reframe: **never assemble a
bundle in dev.** The browser builds the module tree itself by following
`import`s; Vite transforms each module per-request. The plugin's only jobs
are (a) emit entry HTML with the right script tags + HMR client, and (b)
provide runnable versions of any Node-side supporting modules.

Request flow:

```
raw HTML template  (contains <?= ?> and <script type=module src=/src/main.ts>)
      │
      ▼  harness: run doGet(e), resolve scriptlets against .gs/.ts via vm
resolved HTML string
      │
      ▼  server.transformIndexHtml(url, html)   → injects HMR client, rewrites script tags
served HTML
      │
      ▼  browser fetches /src/main.ts → Vite middleware transforms it lazily → walks the import tree
```

- `server.transformIndexHtml(url, htmlString)` takes the scriptlet-evaluated
  HTML **string** produced by `doGet` and returns HTML with the HMR client
  injected and plugin HTML transforms applied — the dev equivalent of "the
  HTML the build would have emitted."
- `.gs`/`.ts` source stays on the raw `vm` harness (never
  `ssrLoadModule`/Module Runner — see the fidelity-leak rationale above);
  `ssrLoadModule` is only for supporting Node-side JS/TS outside that source.
- Middleware must be registered **inside** `configureServer`, ordered before
  Vite's built-in HTML middleware, or Vite's parser may choke trying to treat
  a raw `<?= ?>` template as a plain HTML entry.
- **Not yet implemented:** scriptlet-evaluated templates live outside Vite's
  module graph, so editing them won't trigger HMR on their own. Needs the
  file watcher extended to watch templates and fire a full-reload
  (`server.ws.send({ type: 'full-reload' })` or a custom `gas-dev:reload`
  event) when they change.

On the real wire, RPC responses carry Google's `)]}'` XSSI prefix and an
internal `[["op-exec", ...]]` envelope; since the shim and backend are a
matched pair we own both ends of, we deliberately don't replicate that
envelope — plain JSON over `fetch` POST is fine. Only the developer-visible
semantics (deserialized value in the handler, `undefined`→`null`, stripped
error shape) need to match, and those already live in the transport shim.

**Standalone server (fallback):** Express exposing `POST /api/:fn`,
optionally serving static FE assets. `gas-dev serve` (all-in-one) or
`gas-dev serve --api-only` (bring your own FE tooling; consumer handles
CORS/proxy). Same core underneath.

---

## Known Prod/Dev Parity Gaps (document for end users)

- Transport is HTTP request/response locally vs. postMessage into a sandboxed
  iframe in prod — timing and payload-size behavior (~50MB one-way cap with
  Apps Script's own serialization overhead) won't perfectly match.
- Promise-returning server functions: prod misbehavior intentionally
  replicated, not fixed.
- Local mode returns fixture data — it cannot surface failures that only
  occur against real APIs.
- Live mode is subject to real latency and quota limits.
- Container-bound APIs are out of scope entirely (see Scope).

## Prior Art

- **`gas-local`** — validates the `vm`-context approach for unit testing, but
  no transport shim, service layer, or HTML templating.
- **`clasp`** — informs the `src/` directory convention; no local execution
  story.

No existing tool covers transport shim + runtime harness + fixture/live
service layer + bundler integration — that's the gap.

---

## v1 Scope & Next Steps

**v1 =** vm harness (per-request rebuild) + transport shim + `doGet` HTML
templating (single-file scriptlets only) + live pass-through for Calendar
(prototyped) + Vite adapter only. Package stays a single npm package named
`gas-p` (no `packages/` monorepo split until a second package exists).

Local/fixture mode, `--record`/record-replay, and the standalone Express
adapter are **deferred past v1** — see [ADR 0001](docs/adr/0001-immediate-live-semantics-no-write-queue.md)
and [ADR 0002](docs/adr/0002-sync-over-async-subprocess-bridge.md) for the
Live-mode semantics this implies (immediate per-call reads/writes, no
generic Write Queue or Resource Cache).

- [x] **Validate sync-over-async bridge** — done via the working
      `CalendarApp` prototype (synchronous subprocess spawn per call).
      Per-call spawn overhead accepted for v1; see ADR 0002.
- [x] Live mode enforces a **dev resource-ID allowlist** — `openById()` /
      `getCalendarById()` throw before any API call if the ID isn't
      declared in config. See [ADR 0003](docs/adr/0003-live-mode-resource-id-allowlist.md).
- [x] Live-mode auth: browser-based OAuth2 consent flow, scopes read from
      `appsscript.json`, credentials at `~/.gas-p/credentials.json`
      (unchanged from the prior design). Service account auth deferred to a
      CI-focused follow-up.
- [ ] Finalize config schema for v1: `srcDir`, `entry` (deterministic
      bundle entry point for `.ts` source — see Runtime Harness; currently a
      `GasPPluginOptions` field, not yet read from a `gas-p.config.ts` file),
      `mode` (included now for forward compatibility, always `"live"` in v1),
      `devResourceIds`, `port`. `fixtures` is **not** in the v1 schema.
- [x] **`.ts` multi-file bundling** — `build({ write: false })` step ahead of
      `vm.runInContext`, `cjs` output, `minify: false` +
      `rollupOptions.treeshake: false` (see Runtime Harness — scope addition
      landed on #19 mid-implementation). `buildBundledContext` in
      `core/context.ts`.
- [x] **Page-load wiring in the Vite plugin** — `doGet` → scriptlet harness →
      `server.transformIndexHtml`, served for GET requests to the configured
      `page` (default `/`). Watcher-driven full-reload on template edits is
      still open (see Adapters).
- [ ] Container-bound API guard errors ("out of scope — use openById()").
- [ ] `PropertiesService` stays local-file-backed (`gas-p.properties.json`,
      seeded via `gas-p pull-properties`) rather than routing through Live
      mode — the Apps Script Properties API requires a deployed script, so
      forcing it through the real-API pass-through would defeat the local
      dev loop. Not a launch blocker; fast-follows Calendar.
- [ ] Fast-follow services after Calendar: `PropertiesService`, then Sheets
      live translation (largest per-service effort — see Sheets' own
      internal write-batching note under Service Layer).

**Deferred past v1:** Local/fixture mode, matcher functions, fixture file
format, `--record` capture, standalone Express adapter, multi-file HTML
template includes.
