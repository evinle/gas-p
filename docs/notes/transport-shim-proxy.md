# How `transportShim.ts`'s Proxy works

Reference for `src/client/transportShim.ts`'s `createScriptRun`/`build`.

## What a Proxy is

A `Proxy` wraps a target object and lets you intercept operations on it —
property reads, writes, `in` checks, function calls, etc. — via "traps" you
define. `new Proxy(target, handlers)` returns an object that looks and acts
like `target` from the outside, but every operation on it first runs through
the matching trap function in `handlers`, if one exists.

The only trap this code uses is `get(target, prop)` — it fires whenever *any*
property is read off the proxy, including via dot-syntax:

```js
const p = new Proxy({}, {
  get(target, prop) {
    console.log('someone read:', prop);
    return () => console.log('called', prop, 'with', arguments);
  },
});

p.foo; // logs "someone read: foo"
p.foo(1, 2); // logs "someone read: foo", then returns a function which is then called with (1, 2)
```

## Why `run.add(2, 3)` is two operations, not one

`run.add(2, 3)` breaks down into:

1. **Property read**: `run.add` — this is what triggers the `get` trap, with
   `prop = "add"`. At this point in evaluation, JS hasn't looked at `(2, 3)`
   yet — it doesn't exist to the engine until step 2.
2. **Function call**: `(...)(2, 3)` — this takes whatever value step 1
   produced and calls it with `2, 3` as arguments, using ordinary JS
   function-call mechanics. The `Proxy` is not involved in this step at all.

The `get` trap has no way to receive `2, 3` directly — by the time it runs,
those arguments haven't been evaluated as part of a call yet. The only way to
eventually get hold of them is for the trap to **return a function**,
deferring "receive arguments" to an ordinary JS call that happens immediately
after:

```ts
get(target, prop) {                 // prop = "add"
  return (...args) => {             // args = [2, 3], captured normally
    fetchImpl(options.endpoint, {
      body: JSON.stringify({ fnName: prop, args }), // prop closed over from outer scope
      ...
    });
  };
}
```

The returned arrow function is an ordinary closure — it captures `prop`
(`"add"`) from its enclosing scope, and `args` comes from nothing more exotic
than being declared as that function's own rest parameter. `args` is
populated the normal way any JS function's arguments are populated when
called — the `Proxy` machinery's job is done after step 1; step 2 is just
calling a function like any other.

If the `get` trap returned anything other than a function — a string, a
number — then `run.add(2, 3)` would throw `TypeError: run.add is not a
function`, because you'd be trying to call a non-callable value. Returning a
function is what makes the property access "callable" at all.

## Why the target object is an empty `{}`

`build()`'s `new Proxy({} as ScriptRun, { get(...) {...} })` never actually
reads or writes the target — every property access is fully intercepted and
manufactured by the `get` trap. The target only exists because the `Proxy`
constructor requires *some* object to wrap; it could be any object, since its
own properties are never consulted.

## How chaining works

`withSuccessHandler`, `withFailureHandler`, and `withUserObject` are handled
as special-cased property names inside the same `get` trap. Instead of
treating them as server function names, each returns a function that calls
`build()` again with a **new** `state` object (`{ ...state, successHandler:
fn }`) — producing a fresh Proxy that carries the accumulated state forward.
That's how `.withSuccessHandler(fn).withFailureHandler(g).someFn()` chains:
each call in the chain hands off an updated, immutable `state` to the next
`Proxy` in the chain, until a non-chain property name (the actual server
function) terminates it and fires the `fetch`.
