# gas-p — Agent Guidelines

## TypeScript

- **No type assertions.** Never use `as SomeType`. Instead, write explicit guard functions that test for the presence and shape of properties at runtime. Guards must check both key existence AND value type — `'key' in x` alone is not sufficient; follow with `typeof x.key === 'string'` (or the appropriate type check). TypeScript narrows correctly after `in` checks, so chained guards require no assertions.

## Testing

- **Use fixture files for known-good inputs.** For happy-path tests that exercise parsing or reading, write static fixture files to `src/__tests__/__fixtures__/` and reference them by path. This avoids untested custom helpers and makes the expected input explicit and reviewable. Only use inline `fs.writeFileSync` (not helper wrappers) for error-case inputs that need to be malformed or missing specific fields.

## Architecture

- **Functional, not stateful.** Prefer functions that take data in and return data out over functions that mutate shared objects as a side effect. Keeps each function independently testable and the call site readable as a pipeline.
- **Group related primitives into interfaces.** Two or more values that always travel together (e.g. `clientId` + `clientSecret`) should be a named interface, not loose parameters. Makes signatures easier to read and swap out.
