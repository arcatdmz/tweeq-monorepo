# Architecture

Tweeq is a pnpm monorepo with two framework renderers over shared behavior and
styles:

```text
@tweeq/core          pure types, parsing, geometry, and state transitions
       ↓
@tweeq/dom           browser controllers, stores, and lifecycle ownership
       ↓
@tweeq/react         React components and hooks
@tweeq/vue           Vue components and composables

@tweeq/styles        shared tokens and component CSS used by both renderers
@tweeq/test-contracts  private conformance suites run against both renderers
```

## Design rules

1. Shared behavior has one owner in `core` or `dom`; renderers adapt it to
   framework-native APIs.
2. `core` has no framework or browser dependencies. `dom` has no React or Vue
   dependencies, and browser effects start only through explicit factories or
   methods.
3. React uses controlled props and hooks. Vue uses `v-model`, slots, and
   composables. Equivalent behavior does not require identical APIs.
4. Both renderers consume the same compiled stylesheet and expose stable
   `data-tq-component` / `data-tq-part` hooks.
5. Shared behavior changes are verified by the same contract suite against
   both renderers. The playgrounds and Playwright suite cover integration and
   visual parity.
6. Public entries must be safe to import in plain Node. Interactive browser
   features initialize lazily and are disposed by their owning runtime.

## Repository layout

- `packages/` contains the shared layers, renderers, and contract harness.
- `docs/*.md` is the shared documentation source for both renderers.
- `apps/docs` compiles that Markdown through MDX for React; `docs/.vuepress`
  renders it with VuePress under `/vue/`.
- `apps/playground-react` and `apps/playground-vue` are exhaustive renderer
  galleries.
- `examples/` contains minimal consumers built from packed package artifacts.
- `docs/migration.md` is the user-facing upgrade guide for the original Vue
  package.

The current cross-renderer guarantees are listed in
[the parity notes](parity-matrix.md).

## Architecture decision records

Files numbered `0001-`, `0002-`, and so on are Architecture Decision Records:
short documents that preserve the context, decision, and consequences of
significant technical choices. Add one when a decision affects repository-wide
contracts or would otherwise be difficult to reconstruct later. Do not rewrite
an accepted decision after circumstances change; add a new ADR that supersedes
it.

Current records cover [package naming and publishing](0001-package-naming-and-publishing.md)
and [browser support and SSR imports](0002-browser-support-and-ssr-imports.md).
