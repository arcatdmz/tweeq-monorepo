# Shared-core React/Vue monorepo migration

Status: **migration complete** — Phases 0–6 implementation, cleanup, and
verification complete (2026-07-14). npm publication is a deferred release
operation and does not block this migration closure; see MF-131 in the
[findings log](./migration-findings.md).
Audience: worker agents and human maintainers  
Scope: the next major structural change after the first React port  
Upstream reference: [baku89/tweeq](https://github.com/baku89/tweeq)

## 1. Objective

Turn this repository into the canonical Tweeq monorepo with:

- one implementation of parameter semantics, validation, formatting, gesture
  state machines, stores, theme generation, and interaction controllers;
- maintained React and Vue 3 renderers with idiomatic public APIs;
- one visual system and one renderer-neutral behavioral contract;
- independently buildable packages, examples, and documentation;
- compatibility paths that let existing Vue code move without a rewrite;
- release automation that versions internal dependencies correctly.

This is a consolidation, not a second port. The existing Vue implementation is
valuable production behavior and the React implementation proves the shared
logic boundary. Preserve both while moving their duplicated logic downward.

## 2. Architectural rules

These are hard constraints. A worker must not bypass them to finish a batch.

1. **Shared behavior has one owner.** Math, parsing, validation, model/display
   synchronization, gesture transitions, selection semantics, persistence, and
   accessibility state live below both renderers.
2. **Renderers remain idiomatic.** React exposes controlled `value` / `onChange`
   and hooks. Vue exposes `modelValue` / `update:modelValue`, slots, composables,
   and normal Vue lifecycle behavior. Do not force one framework's API onto the
   other.
3. **No framework imports below a renderer.** Core and DOM packages must not
   import `react`, `react-dom`, `vue`, Pinia, or framework component types.
4. **No side effects at module import.** Browser listeners, DOM writes, stores,
   WebGL contexts, and timers are created by explicit factories and disposed by
   their owner. Packages must be safe to import during SSR and tests.
5. **Behavior before abstraction.** Extract a contract from the working Vue and
   React implementations; do not invent a generalized controller without parity
   fixtures that prove it.
6. **Shared styling is a contract.** Renderers use the same stable classes or
   `data-tq-part` attributes and compiled theme CSS. Framework-scoped styling is
   reserved for genuinely renderer-specific mechanics.
7. **A migrated component is tested twice.** The same renderer-neutral contract
   suite must pass against React and Vue, plus framework-specific API tests.
8. **Incremental releases stay possible.** Every migration phase leaves both
   renderers buildable. Do not create a long-lived state where one renderer is a
   broken reference tree.

## 3. Target workspace

Use a pnpm workspace. `workspace:` dependencies prevent accidentally resolving
published copies during local development, while a single lockfile and catalog
keep tool and peer ranges aligned.

```text
.
├── apps/
│   ├── docs/                    # React-based documentation shell
│   ├── playground-react/        # exhaustive React behavior playground
│   └── playground-vue/          # exhaustive Vue behavior playground
├── examples/
│   ├── react-vite/              # minimal consumer, packed-package smoke test
│   └── vue-vite/                # minimal consumer, packed-package smoke test
├── packages/
│   ├── core/                    # @tweeq/core: pure/domain state and contracts
│   ├── dom/                     # @tweeq/dom: browser controllers and gestures
│   ├── styles/                  # @tweeq/styles: tokens and shared component CSS
│   ├── react/                   # @tweeq/react
│   ├── vue/                     # @tweeq/vue
│   └── test-contracts/          # private shared renderer conformance suites
├── docs/
│   ├── architecture/
│   └── ...                      # research and authoring documentation
├── pnpm-workspace.yaml
├── package.json                 # private task runner only
└── pnpm-lock.yaml
```

### 3.1 Package responsibilities

#### `@tweeq/core`

Pure TypeScript or browser-independent state. It owns:

- public value types and component option types shared by both renderers;
- number/time/color parsing, display formatting, quantization, and validators;
- theme scale generation and semantic token computation;
- immutable state transition functions and controller contracts;
- menu/action models, selection algorithms, geometry, and serialization;
- store interfaces and explicit store factories;
- test fixtures for exact edge cases such as decimal precision and frame
  quantization.

It must not reference `window`, `document`, DOM types in its public contract, or
instantiate singleton application state.

#### `@tweeq/dom`

Framework-neutral browser integration. It owns:

- pointer/keyboard/wheel gesture engines;
- element measurement and resize/scroll observation;
- focus, pointer capture/lock, native popover, CSS anchor, and cursor adapters;
- explicit controller factories that bind core transitions to DOM events;
- lifecycle handles shaped as `{dispose(): void}`;
- browser stores whose instances are created per Tweeq application/viewport;
- WebGL/Monaco integration that is renderer-neutral where practical.

DOM access must occur inside factories or methods, never on import. Feature
detection belongs here and must produce actionable fallbacks/errors.

#### `@tweeq/styles`

The common visual implementation. It owns:

- design tokens and generated `--tq-*` variables;
- reset and viewport styles;
- stable component parts such as `.tq-input-number` and
  `[data-tq-part='handle']`;
- popup/top-layer resets and animation definitions;
- one distributable `style.css` plus documented optional entries if splitting
  later becomes necessary.

Prefer stable global selectors scoped under `.TqViewport` over duplicating Vue
scoped Stylus and React CSS Modules. Both renderers must emit equivalent parts.
Keep Stylus initially to avoid a style rewrite; changing preprocessors is a
separate decision after parity.

#### `@tweeq/react`

React 18+ renderer and adapters. It owns JSX, portals, contexts, refs, and hooks.
External stores/controllers are consumed through `useSyncExternalStore` or a
small wrapper with a stable cached snapshot and an SSR snapshot. React and
ReactDOM are peer dependencies and build externals.

#### `@tweeq/vue`

Vue 3 renderer and adapters. It owns SFCs, slots, directives, provide/inject,
and composables. A controller adapter subscribes into `shallowRef` state and
disposes via `onScopeDispose`; it must not copy controller transitions into
watchers. Vue is a peer dependency and build external. Pinia may remain only
behind a temporary compatibility adapter and is removed once all stores are
created by shared factories.

#### `@tweeq/test-contracts` (private)

Defines a small renderer harness interface (`mount`, `part`, `pointer`, `key`,
`value`, `events`, `unmount`) and exports parameterized suites. It is test-only
and never published.

## 4. The shared controller pattern

Use renderer-neutral controllers for stateful components, but keep stateless
utilities as plain functions. Do not turn every helper into a class.

```ts
export interface Controller<S, C> {
  getSnapshot(): S
  subscribe(listener: () => void): () => void
  commands: C
  updateOptions(next: unknown): void
  dispose(): void
}
```

Requirements:

- snapshots are immutable and referentially stable until state changes;
- commands perform synchronous transitions where the legacy control does;
- controlled values enter through `updateOptions`/`setExternalValue` and never
  become a second source of truth;
- renderer callbacks are ports supplied at construction, not imported globals;
- timers and browser resources are owned and disposed by the controller;
- DOM-specific inputs are injected through narrow ports such as `measure()`,
  `focus()`, `setCursor()`, or a DOM adapter created in `@tweeq/dom`.

React subscribes with `useSyncExternalStore`. Vue copies each new snapshot into
a `shallowRef`, making the external state boundary explicit rather than deeply
proxying controller internals. This follows the frameworks' documented external
store integration models.

Not every component needs a controller. `InputButton` may share only types and
styles; `InputNumber`, `InputTime`, `InputColor`, popovers, multi-selection, and
drag-driven controls do.

## 5. Reusing the existing Vue implementation

Use a strangler migration. Never translate all Vue SFCs again.

### Stage V0 — freeze a behavioral baseline

- Record the current Vue and React demo URLs/screenshots for every component.
- Turn important legacy unit cases into core fixtures.
- Add a parity matrix listing props, events, slots/render props, keyboard,
  pointer, overlay, persistence, and visual states.
- Mark known intentional differences; everything else is a regression.

### Stage V1 — relocate Vue without behavior changes

- Move the legacy Vue source into `packages/vue/src/` with history-preserving
  `git mv` operations.
- Keep existing internal import paths working through temporary package-local
  aliases.
- Produce `@tweeq/vue` with the original exports and `v-model` API.
- Move its playground to `apps/playground-vue` and prove the built package, not
  source aliases, works in `examples/vue-vite`.

This stage must not refactor component logic. Its gate is byte/behavioral
equivalence, a successful package build, and the existing Vue demos.

### Stage V2 — replace leaf logic

For one component family at a time:

1. identify pure functions currently inside the Vue SFC/composable and their
   equivalents in React;
2. write shared fixtures from both implementations, including weird decimal,
   out-of-range, modifier-key, and cancellation cases;
3. move the single implementation to `@tweeq/core`;
4. switch Vue and React callers to it without changing public APIs;
5. delete the two old copies only after both contract suites pass.

Start with leaf utilities: labelizers, validators, timecode, numeric precision,
theme, menu construction, color conversion, and geometry.

### Stage V3 — adopt shared DOM/controller behavior

- Wrap the shared controller in a Vue composable that returns refs and methods.
- Preserve legacy `flush: 'sync'` semantics by performing controller commands at
  the originating event site, not by building chains of asynchronous watchers.
- Keep Vue slots and directives as renderer code; connect them to stable
  controller parts and commands.
- Replace Pinia store access with injected shared store instances one store at a
  time. Supply a compatibility `useTweeq()` facade until consumers migrate.
- Move each component to shared CSS parts after behavioral parity, not before.

### Stage V4 — remove compatibility code

Delete an alias, legacy composable, Pinia store, or scoped style only when `rg`
shows no consumers and both packed examples plus contract tests pass. Maintain a
deletion checklist in the parity matrix rather than leaving TODO comments.

## 6. Public API and package policy

Recommended publish names are `@tweeq/core`, `@tweeq/react`, and `@tweeq/vue`.
Do not publish or rename packages until ownership of the npm scope and the fate
of the unscoped `tweeq` name are explicitly decided.

Initial policy:

- keep React and Vue public component names aligned where the concepts align;
- keep framework conventions (`value` versus `modelValue`) distinct;
- export shared value/option types from core and re-export useful types from
  each renderer;
- provide explicit `@tweeq/react/style.css` and `@tweeq/vue/style.css` aliases
  to the same `@tweeq/styles` artifact for ergonomic compatibility;
- preserve current React imports through a temporary compatibility entry during
  one major release;
- preserve original Vue exports through `@tweeq/vue` compatibility tests;
- prohibit renderer packages from importing each other;
- treat DOM structure and `data-tq-part` names as an internal-but-tested style
  contract, not public customization API, until documented otherwise.

Use Changesets for version intent and changelogs. Begin with a fixed version
group for the public Tweeq packages so one release number identifies a coherent
renderer/core set. Reconsider independent versions only after the dependency
boundaries and compatibility policy have stabilized.

## 7. Tooling and CI

### Workspace and builds

- pnpm workspace with one lockfile and a root `packageManager` field pinned to
  an exact pnpm version;
- `workspace:^` for published internal dependencies and `workspace:*` for
  private tooling packages;
- a pnpm catalog for shared dev/peer ranges;
- TypeScript strict mode with a root base config and package-local configs;
- Vite library mode for React/Vue packages, with the matching official plugins,
  framework peers externalized, ESM output, declaration output, sourcemaps, and
  explicit CSS exports;
- a simple TypeScript build for core/dom; use Vite there only if asset handling
  requires it;
- root scripts use `pnpm -r --if-present` and filters. Do not introduce an
  orchestration framework until measured task-graph/caching needs justify one.

### Tests

CI required checks:

1. formatting/lint and workspace dependency validation;
2. TypeScript build in package dependency order;
3. core/dom unit tests in Vitest;
4. React component/API tests;
5. Vue component/API tests;
6. shared contract suite against both renderers;
7. Playwright parity tests in Chromium at minimum, including pointer-lock and
   native popover capabilities used by Tweeq;
8. light/dark visual screenshots for representative states and mobile widths;
9. `pnpm pack` each public package and install tarballs into both clean example
   apps to catch missing files, bad exports, accidental source aliases, and
   undeclared dependencies;
10. docs build and GitHub Pages deployment only after all preceding gates pass.

Add size reports as non-blocking artifacts first. Make budgets blocking only
after a baseline is recorded. Test SSR imports in Node even though Tweeq's
interactive behavior is browser-only.

### Releases

- Changesets records user-visible package changes in feature/fix PRs;
- a release PR applies versions/changelogs;
- publishing uses npm trusted publishing/provenance if repository/package
  ownership supports it;
- tags identify the fixed package version (`vX.Y.Z`);
- prereleases (`next`) are required for the monorepo migration before stable.

## 8. Migration phases and worker assignments

Each phase below is independently reviewable. One worker owns a package or
component family; only the integration worker edits root workspace files and
shared registries during parallel work.

### Phase 0 — baseline and decisions

Deliverables:

- `docs/architecture/parity-matrix.md` generated from current exports;
- package naming/npm ownership decision recorded as an ADR;
- browser support and SSR-import policy recorded as an ADR;
- current React and Vue packaged-build baselines;
- protected snapshot/interaction fixtures for InputNumber, InputAngle,
  InputTime, InputColor, InputDropdown, overlays, and multi-select.

Gate: no unexplained public API or behavior item in the matrix.

### Phase 1 — workspace skeleton

Deliverables:

- pnpm workspace, package manifests, root scripts, Changesets, CI matrix;
- empty/buildable target packages and private contract package;
- move demos to `apps/` and add clean consumer examples;
- preserve current package build and Pages deployment while paths change.

Gate: every package builds; packed React example works; existing tests pass.

### Phase 2 — relocate implementations

Deliverables:

- `src/core` moved to `packages/core`/`packages/dom` according to import rules;
- React moved to `packages/react` without behavior changes;
- legacy Vue moved to `packages/vue` without behavior changes;
- dependency-cruiser or an equivalent small boundary test prevents forbidden
  framework imports and cycles.

Gate: both packed examples and both exhaustive playgrounds run. No feature
refactor is accepted in this phase.

### Phase 3 — shared foundations

Suggested parallel workstreams:

- theme/tokens/styles;
- config/actions/menu/modal store factories;
- geometry/drag/focus/popover DOM adapters;
- numeric/time parsing and formatting;
- color/GL utilities.

Gate: React and Vue consume the same implementations; deleted duplicate files
are listed in the parity matrix; tests cover former differences.

### Phase 4 — component-family controllers

Migrate in dependency order:

1. primitives, icons, groups, buttons, switches;
2. text and dropdown controls;
3. number and vector/position/size controls;
4. rotary, angle, drum, ruler, time, timeline;
5. popover, tooltip, menus, command palette, multi-select;
6. color, GL, code, and curves;
7. parameter grids, tabs, panes, modals, title bar, and App.

Each family change contains core/controller tests, both renderer adapters,
shared contract tests, demos, and deletion of superseded logic. A worker must
not mark a family complete with one renderer still using copied transitions.

Gate: parity matrix complete for the family and no unowned behavior copy.

### Phase 5 — documentation and compatibility

Deliverables:

- docs can render React and Vue examples without conflating their APIs;
- migration guides for existing Vue users and current React-fork users;
- API references generated/validated from each package's public exports;
- UIST and user-study demos selectable in both renderers where applicable;
- deprecation warnings and compatibility entry have a removal version.

Gate: all documented snippets run in tests and all links target the correct
renderer/package.

### Phase 6 — cleanup and release readiness (complete)

Deliverables:

- test packed artifacts in clean downstream Vue and React applications;
- remove temporary aliases, source mirrors, and compatibility stores that have
  met their removal criteria;
- record bundle size, runtime performance, and interaction parity baselines;
- prepare a CI-only, provenance-enabled publication path without publishing
  before npm ownership and the protected approval boundary are configured.

Migration gate: clean dependency graph, no obsolete compatibility TODOs,
artifact-first package/application builds, clean packed consumers, comparable
React/Vue Pages galleries, and reproducible release readiness from CI.

Publishing a `next` prerelease and the later stable feedback cycle are follow-up
release operations, not migration-completion requirements. They remain blocked
by the explicit external configuration in MF-131.

## 9. Per-component worker checklist

Copy this checklist into the worker's issue/PR and fill every item.

- [ ] Read both current implementations and the original Vue history.
- [ ] Add/update the parity matrix before changing behavior.
- [ ] Capture edge cases as renderer-neutral fixtures.
- [ ] Record any discovered defect and its disposition in
      [`migration-findings.md`](./migration-findings.md), even when fixed in the
      same change.
- [ ] Identify pure logic, DOM logic, renderer logic, and shared styles.
- [ ] Move pure logic to core; move browser lifecycle to dom.
- [ ] Implement or reuse a controller only if stateful behavior needs one.
- [ ] Adapt React without changing controlled semantics.
- [ ] Adapt Vue without changing `v-model`, slots, or event timing.
- [ ] Emit the same stable style parts from both renderers.
- [ ] Run shared contract tests against both renderers.
- [ ] Run framework-specific tests and relevant Playwright gestures.
- [ ] Verify keyboard, pointer, touch, disabled, invalid, light/dark, and mobile.
- [ ] Delete superseded copies and compatibility code whose criteria are met.
- [ ] Add a Changeset for user-visible changes; omit it for internal-only moves.
- [ ] Update docs and examples in the same change as a public API change.
- [ ] Commit one semantic unit; do not mix workspace churn with behavior fixes.

## 10. Commit and parallel-work policy

Use Conventional Commit subjects with an explicit package/scope, for example:

- `chore(workspace): add pnpm package skeleton`
- `refactor(core): share timecode quantization`
- `refactor(input-time): adopt shared controller in React and Vue`
- `test(input-time): add cross-renderer frame contract`
- `docs(migration): explain Vue compatibility entry`

Pure moves precede refactors. Behavior fixes precede or follow extraction in a
separate commit with a regression test. Never combine generated lockfile churn,
an unrelated component fix, and a package move.

When workers run in parallel:

- integration worker owns root manifests, lockfile, CI, Changesets config, and
  package export maps;
- family workers own only their assigned package paths, fixtures, and a status
  note under `docs/architecture/workstreams/`;
- workers do not commit other workers' files or rewrite shared history;
- integration happens in dependency order; contract tests are the merge gate;
- a blocked worker records the exact API/port needed, never copies logic across
  the boundary as a workaround.

## 11. Explicit non-goals

- Do not redesign Tweeq's visual language during the structural migration.
- Do not replace native popover/CSS-anchor mechanics without a separate browser
  support decision and interaction benchmarks.
- Do not replace Stylus, Zustand, Monaco, regl, or bndr-js solely for novelty.
- Do not make Vue wrap React or React wrap Vue.
- Do not expose a lowest-common-denominator component API.
- Do not publish packages before naming, ownership, and compatibility ADRs.
- Do not delete the original Vue docs/demos until the Vue workspace package and
  dual-renderer docs cover them.

## 12. Reference rationale

- pnpm workspaces and the `workspace:` protocol are documented at
  <https://pnpm.io/workspaces>; catalogs are documented at
  <https://pnpm.io/catalogs>.
- Changesets' monorepo versioning and release workflow is documented at
  <https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md>.
- Vite's official library-mode guide covers multiple entries, externalizing
  React/Vue, and CSS export maps:
  <https://vite.dev/guide/build.html#library-mode>.
- React's external store adapter contract is `useSyncExternalStore`:
  <https://react.dev/reference/react/useSyncExternalStore>.
- Vue recommends `shallowRef` when integrating external state systems:
  <https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems>.

These references justify the workspace/release/reactivity mechanics. Tweeq's
component boundaries and migration order come from this repository's actual
dependency graph and the parity risks observed during the React port.
