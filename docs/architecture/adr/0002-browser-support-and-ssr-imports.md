# ADR 0002: Browser support and SSR-import policy

Status: accepted  
Date: 2026-07-12  
Phase: 0 (monorepo migration)

## Context

Tweeq relies on comparatively new platform features: the native Popover API,
CSS anchor positioning, pointer lock/capture, `ResizeObserver`, WebGL (regl),
and top-layer animations. The migration plan (architecture rule 4) also
requires every package to be importable in Node for SSR and tests.

## Decision

### Browser support

- **Supported**: the last 2 major versions of Chromium-based browsers, i.e.
  the set where the Popover API *and* CSS anchor positioning are native.
  Chromium is the reference implementation and the only required Playwright
  target (CI gate 7).
- **Best effort**: current Firefox and Safari. Feature detection lives in
  `@tweeq/dom` and must degrade to actionable fallbacks or explicit errors —
  never silent misbehavior. Replacing native popover/anchor mechanics with a
  polyfill/library is out of scope (plan §11) and would need its own ADR plus
  interaction benchmarks.
- No IE/legacy-Edge support. No dynamic polyfill injection by the library;
  consumers own polyfills.

### SSR-import policy

- Every published package must be importable under plain Node (no DOM
  globals) without throwing or leaking side effects. CI runs an SSR
  smoke-import of each package's entry points (gate: "Test SSR imports in
  Node").
- `@tweeq/core` never references `window`/`document` and exposes no DOM types
  in its public contract.
- `@tweeq/dom` may reference DOM types statically, but only touches DOM
  globals inside factories/methods invoked by the consumer.
- Renderer packages must render nothing DOM-dependent at import time;
  interactive behavior is browser-only by design and may no-op or defer under
  SSR, but must hydrate cleanly.

## Consequences

- `typeof document === 'undefined'` guards are allowed only in `@tweeq/dom`
  and renderer packages, not in core.
- The Playwright matrix stays Chromium-first; adding WebKit/Firefox jobs is an
  additive change that doesn't block the migration.
- Documented feature requirements (popover, anchor, pointer lock) become part
  of the public README of each renderer package in Phase 5.
