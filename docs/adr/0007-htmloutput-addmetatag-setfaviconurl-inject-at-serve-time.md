# addMetaTag/setFaviconUrl inject tags at serve time, not into getContent()

`HtmlOutput.addMetaTag(name, content)` and `setFaviconUrl(iconUrl)` track their values as separate state (`getMetaTags()`, `getFaviconUrl()`) rather than mutating the output's HTML string. Issue #34 originally assumed these methods would "produce the expected tags in `getContent()`'s output" directly. That assumption was wrong; what real Apps Script does is more specific.

Verified against two real deployments (an org-restricted "Anyone within domain" one and a public "Anyone" one), both running:

```js
function doGet() {
  return HtmlService.createHtmlOutput('<p>hi</p>')
    .addMetaTag('viewport', 'width=device-width')
    .setFaviconUrl('https://example.com/icon.png');
}
```

Two separate facts came out of this:

1. **`getContent()` itself is never mutated.** Logging `getContent()` right after chaining these calls in the Apps Script editor showed only the original `<p>hi</p>` — no injected tags. This confirms `HtmlOutput`'s own content string is not where the tags live.
2. **The served page's `<head>` does get the tags, at serve time.** View-source on the deployed `/exec` URL showed (among Google's own furniture tags):
   ```html
   <meta name="viewport" content="width=device-width"/>
   <link rel="shortcut icon" type="image/png" href="https://example.com/icon.png"/>
   ```
   This is GAS's serving layer injecting them into the page it wraps the app's HTML in — a separate step from `getContent()`.

gas-p mirrors this split: `HtmlOutput.getContent()` stays pure (matches fact 1), and `harness.ts`'s `invokeDoGet` — the point where a `doGet()` result becomes the string actually served — injects the tracked meta/favicon tags into the content's `<head>` (or synthesizes one and prepends it, if none exists) immediately before returning (matches fact 2). See `injectHeadTags` in `src/core/harness.ts`.

The exact tag markup (attribute order, `rel="shortcut icon"` wording, `type="image/png"` on the favicon link) is reproduced verbatim from the one real sample available. Whether `type` varies with the favicon URL's actual extension (e.g. `.ico` vs `.png`) wasn't tested — only a `.png` URL was tried. If this ever needs a different content type, that's unverified and would need its own real-execution check first, per [CONTRIBUTING.md's "Filling in a stub" step 2](../../CONTRIBUTING.md#filling-in-a-stub).
