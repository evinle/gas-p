# Enforce a dev resource-ID allowlist in Live mode

Live mode mutates real Google resources, so a copy-pasted production calendar or spreadsheet ID in `.gs` code could silently write to production data during local dev. Rather than just documenting this risk, gas-p requires dev resource IDs to be declared in config; `openById()`/`getCalendarById()` (and equivalents) throw before making any API call if the ID isn't in that allowlist.
