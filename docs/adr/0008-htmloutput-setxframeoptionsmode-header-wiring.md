# HtmlOutput.setXFrameOptionsMode() wired to a real X-Frame-Options header

`HtmlOutput.setXFrameOptionsMode(mode)` now stores the requested mode (`HtmlService.XFrameOptionsMode.DEFAULT` or `.ALLOWALL`, retrievable via the gas-p-internal `getXFrameOptionsMode()` — not part of the real GAS surface, which has no getter), and `vitePlugin.ts`'s doGet middleware sets the served page's `X-Frame-Options` header accordingly.

Google's own reference docs for `XFrameOptionsMode` don't specify the actual header value:

- `ALLOWALL`: "No `X-Frame-Options` header is set. This lets any site iframe the page..."
- `DEFAULT`: "Sets the default value for the `X-Frame-Options` header, which preserves normal security assumptions. If a script does not set an `X-Frame-Options` mode, Apps Script uses this mode as the default."

An initial attempt to verify this via `curl` against real deployments was misleading — it hit login/warden redirect pages and 403 responses rather than the actual `doGet()` output, and looked like DEFAULT produced no header at all. Checking the same URLs in a real anonymous browser tab instead (both an org-restricted "Anyone within domain" deployment and a public "Anyone" deployment on a personal account) gave a clean, consistent result:

- **DEFAULT** (no `setXFrameOptionsMode()` call): served with `X-Frame-Options: SAMEORIGIN`.
- **ALLOWALL**: served with no `X-Frame-Options` header at all — matching the docs' own description of that mode.

This is a stable, verifiable, two-value contract (unlike `HtmlTemplate.getCode()`'s undocumented internal format in ADR 0005), so gas-p implements it directly: `vitePlugin.ts` sets `X-Frame-Options: SAMEORIGIN` unless the returned `HtmlOutput`'s tracked mode is `ALLOWALL`, in which case the header is omitted.
