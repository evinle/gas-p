# HtmlOutput.setXFrameOptionsMode() left as a chainable no-op

`HtmlOutput.setXFrameOptionsMode(mode)` is a real method on the GAS surface, taking `HtmlService.XFrameOptionsMode.DEFAULT` or `.ALLOWALL`. Issue #34 wanted it wired so the mode is "observable by the plugin's page-serving middleware ... and actually changes the served `X-Frame-Options` header." It remains a chainable no-op that doesn't even store the mode value, deliberately.

Google's own reference docs for `XFrameOptionsMode` don't specify the actual header value:

- `ALLOWALL`: "No `X-Frame-Options` header is set. This lets any site iframe the page..."
- `DEFAULT`: "Sets the default value for the `X-Frame-Options` header, which preserves normal security assumptions. If a script does not set an `X-Frame-Options` mode, Apps Script uses this mode as the default."

`DEFAULT`'s wording implies some header value is set, but never says which one. Community knowledge (not official docs) commonly claims `SAMEORIGIN`.

We verified against real Apps Script execution rather than guessing, the same way ADR 0005 did for `getCode()`. A `doGet()` that never calls `setXFrameOptionsMode()` (i.e. the DEFAULT case) was deployed as a web app twice — once restricted to "Anyone within the organization," once to "Anyone" — and its actual response headers inspected both times (via browser DevTools Network tab and `curl -sIL`). In both deployments, **no `X-Frame-Options` header was present at all** — only `x-content-type-options` and `x-xss-protection` showed up. This directly contradicts the "DEFAULT sets a protective header" reading of the docs, and doesn't match the commonly-claimed `SAMEORIGIN` value either.

Because:

- The only two real samples we have (both DEFAULT) show no header, which isn't itself a usable "here's the value" data point — we still don't know what `ALLOWALL` would look like next to it, or whether the two modes are even distinguishable in the response we can observe.
- Docs don't specify the value.
- Implementing a specific header for DEFAULT (e.g. `SAMEORIGIN`) would mean shipping a guess that our own real-execution evidence doesn't support, and that a future real check could directly contradict.

...we chose not to guess. A wrong-but-plausible header value is worse than an honest no-op — it would look like a real security control while being unverified against the system it's supposed to mirror.

If a future check (e.g. an `ALLOWALL` sample, or a deployment type not yet tried) establishes a clear, distinguishable contract, revisit this — `HtmlOutput` would need to start storing the mode and `vitePlugin.ts`'s doGet middleware would need to read it off the returned output before calling `res.writeHead()`.

See [CONTRIBUTING.md's "Filling in a stub" step 2](../../CONTRIBUTING.md#filling-in-a-stub).
