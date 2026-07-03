# Drop the generic Write Queue and Resource Cache; Live mode is immediate per-call

Real Apps Script executes most services as synchronous, immediate round-trips with no cross-call batching or caching (Sheets is the sole exception, with its own internal auto-flush). We dropped the generic Write Queue and Resource Cache from core in favor of this: every Live-mode call, read or write, is an immediate round-trip, so a script never sees stale data after its own write. Sheets may still implement its own internal batching as a service-specific exception, not a shared core mechanism.
