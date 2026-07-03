# gas-p — Agent Guidelines

## Issue Tracking

Issues are on GitHub at **https://github.com/evinle/gas-p/issues**. When the user refers to an issue by number (e.g. "#3"), look it up there.

## TypeScript

- **No type assertions.** Never use `as SomeType`. Instead, write explicit guard functions that test for the presence and shape of properties at runtime. Guards must check both key existence AND value type — `'key' in x` alone is not sufficient; follow with `typeof x.key === 'string'` (or the appropriate type check). TypeScript narrows correctly after `in` checks, so chained guards require no assertions.

## Testing

- **Use fixture files for known-good inputs.** For happy-path tests that exercise parsing or reading, write static fixture files to `src/__tests__/__fixtures__/` and reference them by path. This avoids untested custom helpers and makes the expected input explicit and reviewable. Only use inline `fs.writeFileSync` (not helper wrappers) for error-case inputs that need to be malformed or missing specific fields.

## Local Development Pattern

`gas-p` is a local dev server for standalone GAS web apps, run via the Vite plugin adapter (`vite dev`, single command, same-origin). The frontend keeps calling `google.script.run.someFunction(...)` completely unmodified — the Transport Shim (a `Proxy`-based drop-in, only active when `typeof google === "undefined"`) intercepts those calls and POSTs them to the local backend. The Runtime Harness executes the real `.gs`/`.js` source in an isolated `vm` context, rebuilt fresh per request, and calls the real `doGet(e)` to serve HTML with scriptlet templating evaluated. GAS source never imports from gas-p and is completely unmodified — no `run()` wrapper, no local-only entry point.

Service calls (`CalendarApp`, etc.) resolve through Live mode by default: real Google API calls via `googleapis`, bridged synchronously through a subprocess-per-call. Every read and write is an immediate round-trip — there's no write batching or read caching in core. Dev resource IDs (calendar IDs, spreadsheet IDs, etc.) must be declared in config; calls against IDs outside that allowlist throw before any API call is made.

See `PRD.md` and `docs/adr/` for the full architecture and the reasoning behind these decisions.

## Architecture

- **Functional, not stateful.** Prefer functions that take data in and return data out over functions that mutate shared objects as a side effect. Keeps each function independently testable and the call site readable as a pipeline.
- **Group related primitives into interfaces.** Two or more values that always travel together (e.g. `clientId` + `clientSecret`) should be a named interface, not loose parameters. Makes signatures easier to read and swap out.
