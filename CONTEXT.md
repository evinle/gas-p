# gas-p — Domain Glossary

## GAS Source
TypeScript files written to run on the Google Apps Script runtime. GAS Source is deployed to Google via clasp and must not import from gas-p or contain any Node-specific code.

## Local Entry Point
A TypeScript file that exists only for local development and is excluded from clasp deployment. Calls `gas-p.run()` wrapping one or more GAS Source functions. Never committed as part of the deployed script.

## Harness
The `gas-p.run(fn)` execution wrapper. Sets up the GAS global scope, executes the provided function, and flushes the Write Queue on completion.

## Shim
A Node.js implementation of a GAS global service (e.g., `SpreadsheetApp`, `CalendarApp`) that exposes the same interface as the real GAS service, backed by real Google API calls via the `googleapis` package.

## Stub
An unimplemented shim method generated from `@types/google-apps-script` that throws `GasPNotImplementedError` when called. Stubs represent the implementation backlog.

## Resource Cache
An in-memory store populated eagerly when a GAS resource is first opened (e.g., `SpreadsheetApp.openById()`). All subsequent method calls on that resource operate synchronously against the cache rather than making additional API calls.

## Write Queue
A queue of pending write operations accumulated during a `gas-p.run()` invocation. Flushed to the Google APIs in sequence at the end of `gas-p.run()`. Ensures GAS source code remains synchronous while writes are applied after all logic has completed.

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
