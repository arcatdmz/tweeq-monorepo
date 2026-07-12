# Workstream status: Phases 0–2 (baseline, workspace, relocation) + Phase 3 leaf tier

Status: **Phases 0–2 complete; Phase 3 foundations and Stage V4 compatibility cleanup complete** (2026-07-13)
Owner: integration worker  
Plan: [../monorepo-migration.md](../monorepo-migration.md)

Concrete defects discovered during this and later workstreams are retained in
the [migration findings log](../migration-findings.md), including fixed items
and deliberately deferred follow-ups.

## Delivered

- **Phase 0**: [parity matrix](../parity-matrix.md) generated from current
  exports; [ADR 0001](../adr/0001-package-naming-and-publishing.md)
  (naming/publishing) and [ADR 0002](../adr/0002-browser-support-and-ssr-imports.md)
  (browser/SSR policy); baseline record (lib + demo builds, 86 unit tests,
  13 Playwright specs).
- **Phase 1**: pnpm workspace with catalog, Changesets (fixed version group),
  `@tweeq/{core,dom,styles,react,vue}` + private `@tweeq/test-contracts`
  (harness interface defined), demo moved to `apps/docs`, pnpm CI.
- **Phase 2**: `src/core` split into `@tweeq/core` (pure) and `@tweeq/dom`
  (browser) along DOM-usage rules; React renderer relocated to
  `@tweeq/react`; legacy Vue relocated byte-identical to `@tweeq/vue` with
  its build restored (Stage V1); shared `common.styl` owned by
  `@tweeq/styles`; shared InputColor shaders owned by `@tweeq/dom/shaders`;
  `scripts/check-boundaries.mjs` enforces architecture rule 3;
  `scripts/test-packed.mjs` packs all public packages and builds
  `examples/{react,vue}-vite` from tarballs (CI gate 9);
  `apps/playground-vue` added.

## Verification state

`pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check:boundaries`,
`pnpm test:ssr`, `pnpm test:packed`, and the full 21-test Playwright suite are
CI gates. The browser suite includes representative light/dark/mobile visual
baselines. The docs app compiles the React packages from source via Vite
aliases; packed-artifact coverage is the examples' job.

## Phase 3 leaf tier (done 2026-07-13)

`@tweeq/vue` now consumes the single shared implementation for: numeric
formatting (`util.ts`), validators (via the new `@tweeq/core/validator`
subpath), the theme (types/palette/radix deleted; the Pinia store computes
through `computeTheme` and applies through `applyThemeToDOM` — 215→77
lines), timecode (converging the hardcoded-24fps expression parsing, see
parity matrix), `CubicBezierValue`/`TimeFormat`, InputShuffle generators
(new core fixtures), and InputColor channel math + shared color types.
The touched Vue modules are re-export shims so every legacy import path
and public export is unchanged.

## Phase 4 family 1 (done 2026-07-13)

The primitives/icons/groups/buttons/switches family is complete. Shared
contracts run in React and Vue for InputButton, InputButtonToggle, InputSwitch,
InputCheckbox, InputGroup, and IconIndicator. Icon source parsing is owned by
core; Iconify loading/cache remains a framework adapter. BindIcon and SvgIcon
contain renderer markup only and no copied state transition.

## Notes for Phase 3/4 workers

- Temporary compatibility items are tracked in the parity matrix's deletion
  checklist — extend it, don't add TODO comments.
- Stage V3 now shares the InputSwitch transitions and InputRotary clamp logic.
  The five app-level Vue stores (actions, appConfig, modal, multiSelect, theme)
  are compatibility facades over the same `@tweeq/dom` instances React uses;
  their duplicated Pinia state and behavior have been deleted.
- The Vue `useDrag` composable is now a ref/lifecycle adapter over the shared
  `@tweeq/dom` drag controller. Stage V4 removed the component-local InputTime
  and regl Pinia wrappers as well, so the Vue package and its consumers no
  longer require Pinia.
- `@tweeq/test-contracts` now supplies the parameterized InputSwitch public
  behavior suite. React and Vue each implement the harness and run the same
  controlled-value and keyboard/confirm contract in jsdom.
- Phase 4 family 1 completed with InputSwitch and InputCheckbox exposing
  identical stable `data-tq-part` names in both renderers and run the same
  controlled-value, keyboard/confirm, disabled, and label contract.
  InputButtonToggle additionally shares controlled activation, native disabled,
  invalid-state, stable-part, and `aria-pressed` coverage.
  InputButton shares action, native-disabled, invalid-state, and content-part
  coverage as the stateless button baseline.
  InputGroup runs the same fragment/whitespace and horizontal/vertical child
  position contract in both renderer harnesses.
  Icon source parsing is shared core logic, while IconIndicator now has aligned
  pressed semantics, pointer/keyboard activation, and stable parts.
- Do not publish any package until ADR 0001's ownership question is settled.

## Phase 4 family 2 (done 2026-07-13)

- InputString expression mode now uses the same core compiler in both renderers;
  the Vue-local `eval` implementation was removed.
- InputDropdown label generation and wrap/empty keyboard navigation now use
  core implementations; both renderers emit aligned listbox/option ARIA parts.
  Its shared contract covers controlled labels, wrapping, empty options, option
  confirmation, and Escape rollback; it also caught and fixed React InputString
  swallowing consumer `onKeyDown` handlers.

## Phase 4 family 3 (done 2026-07-13)

- InputNumber expression mode now uses the shared core compiler in both
  renderers; the Vue-local `eval` implementation was removed.
- Its shared renderer contract covers controlled updates, numeric and expression
  edits, configured-step keyboard changes, disabled state, and stable parts.
- InputSize now uses the core aspect-ratio controller in both renderers, and its
  ratio toggle is a native button with matching disabled and pressed semantics.
- Vue InputVec now propagates disabled and invalid state to each numeric input.
- InputTranslate now uses core-owned bounds decomposition and overlay geometry
  in both renderers. Its shared contract covers bounded drag updates, lifecycle
  event order, native disabled/invalid semantics, and stable overlay parts.
- InputPosition remains a thin composition of the aligned InputTranslate and
  InputVec adapters and forwards their controlled bounds, state, and lifecycle.

## Phase 4 family 4 (done 2026-07-13)

- InputTime now uses the core expression compiler and tweak quantizer in both
  renderers; Vue no longer carries an eval-based parser or copied snap logic.
- Its shared renderer contract covers controlled frame display, time
  expressions with bounds, frame-aware keyboard increments, disabled state,
  invalid expressions, and stable text-input parts.
- Vue InputTime no longer emits blur while mounting, confirms consistently on
  real blur, and blocks drag interaction while disabled.
- InputDrum now shares cell layout, drag advancement, click offsets, wheel
  accumulation, index clamping, and type-ahead matching through core helpers.
  Its shared renderer contract also protects controlled selection, keyboard
  navigation, disabled/invalid state, and stable visual parts.
- Wheel events spanning multiple thresholds now advance every requested step;
  the prior adapters repeatedly selected only the first step before a
  controlled parent could re-render.
- InputRotary now uses the core continuous drag/snap transition and geometry in
  both renderers. Vue's remaining local shim and copied validator transition
  were deleted, and external model values now resynchronize its local state.
- The rotary shared contract covers controlled angle/offset rendering, native
  disabled and invalid semantics, and stable visual parts. InputAngle remains a
  responsive composition of the contracted InputRotary and InputNumber.
- Timeline now uses native wheel events in both adapters and core-owned
  pan/zoom/show/center transitions. Vue gained the documented scrollbar-right
  slot and now handles vertical pan consistently with React.
- Ruler scale generation, pixel geometry, and pointer-value mapping are
  core-owned, including finite behavior for zero-sized ranges and viewports.
  Shared Ruler and Timeline contracts protect their slots and stable parts.

## Phase 4 family 5 (in progress)

- CommandPalette history and selection transitions are core-owned. Commands
  now run through the shared actions store so lifecycle hooks are preserved,
  and Vue matches the cross-platform Ctrl/Cmd+P and arrow-key behavior.
- Menu now consumes the shared item model and safe-submenu-corridor geometry in
  both renderers. Its shared contract covers commands, short labels,
  separators, close propagation, controlled updates, and stable parts.

## Retrospective Phase 0–2 audit repair (2026-07-13)

- Core and DOM production ESM now uses explicit `.js` specifiers and is
  importable by plain Node.
- Vue removed its remaining Pave dependency in favor of shared core geometry
  and SVG paths, lazily creates regl/Monaco browser state, and is safe to import
  without DOM globals.
- Vue declaration generation excludes renderer contract tests.
- CI now enforces SSR imports and Chromium parity/visual tests; Changesets
  record the accumulated user-visible Phase 4 behavior changes.
- The Phase 0/1 retrospective also corrected Vue's CommonJS entry while
  retaining its browser UMD build, narrowed packed source assets to owned
  shader files, removed stale renderer dependencies, checks packed artifacts
  for test leakage, and extended the boundary gate to reject undeclared
  workspace imports and dependency cycles.
- GitHub Pages deployment now runs only for a successful CI workflow commit,
  instead of racing the required gates on the same push.
- The packed-package audit now rejects leaked tests, exercises each renderer's
  CommonJS export, and type-checks clean React/Vue consumers before bundling.
  It no longer rewrites live package manifests while creating artifacts.
- A generated Vite timestamp config with machine-local absolute paths was
  removed and is now ignored; the dormant legacy Vue docs alias points at the
  relocated Vue package instead of the deleted root `src/` entry.
- Core now compiles without the DOM library; its remaining `DOMRectReadOnly`
  adapter moved to `@tweeq/dom`, enforcing ADR 0002 at the type-system level.
