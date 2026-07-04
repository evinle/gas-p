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
