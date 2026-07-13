# Renderer parity matrix

Status: living document, required by Phase 0 of
[monorepo-migration.md](./monorepo-migration.md)  
Generated from the exports of `src/index.ts` (Vue), `src/react/index.ts`
(React), and `src/core` on 2026-07-12 (`feat/monorepo`, base `d859bed`).

A row is *complete* when both renderers consume the same core/dom
implementation, pass the shared contract suite, and every superseded copy is
deleted. Anything not listed under "Known intentional differences" is a
regression.

The first executable renderer-neutral suite lives in
`@tweeq/test-contracts` and runs the same InputSwitch controlled-value and
keyboard/confirm contract against both React and Vue.

## Baseline record (Phase 0 gate)

Captured on `feat/monorepo` at `d859bed` with Node 24.16.0 / yarn 1.x:

| Check | Result |
| --- | --- |
| `yarn build` (React library, Vite lib mode) | ✅ builds `lib/` (ES + CJS + d.ts) |
| `yarn build:demo` (React docs demo, Pages artifact) | ✅ builds `demo/dist` |
| `yarn vitest run` (core unit tests) | ✅ 22 files, 86 tests |
| Playwright e2e (`yarn e2e`, Chromium) | 13 spec files covering primitives, numbers/vectors, temporal, rotary, dropdown/code, color/curves, overlays, text/toggles, layout/modals, docs pages, mobile widths |
| Vue renderer | ⚠️ dormant: SFCs are byte-identical to `upstream/main` but are not built by the current toolchain (no `vue`/`pinia` in the manifest) |
| Public demo | GitHub Pages, deployed from `feat/react` via `.github/workflows/deploy.yml` |

The Vue column below therefore describes the **upstream-frozen** behavior; its
build is restored in Phase 2 (Stage V1) inside `packages/vue`.

## Component families

Columns: **Core** = framework-neutral logic module in `src/core` shared *today*
by both implementations (`—` = logic still duplicated in renderer code);
**E2E** = Playwright specs exercising the React implementation.

| Family | Vue | React | Core | E2E specs | Notes |
| --- | --- | --- | --- | --- | --- |
| App | SFC | ✅ | DOM store initialization | layout-modals | appId/theme options, provider ownership, embedded layout, viewport initialization, and stable root aligned in Phase 4 |
| Balloon | SFC | ✅ | `balloon` | — | |
| BindIcon | SFC | ✅ | — | — | |
| ColorIcon | SFC | ✅ | — | — | |
| CommandPalette | SFC | ✅ | — | core history/navigation + dropdown-code | fuzzy search via `fast-fuzzy`; shared action lifecycle hooks, recent-history updates, wrap navigation, Ctrl/Cmd+P, feature-safe local fallback, combobox/listbox selection semantics, stable parts, and canonical styling aligned |
| GlslCanvas | SFC | ✅ | `glsl` | shared DOM renderer + color-curves | one regl queue/context, resize redraw, stale-work invalidation, and unmount disposal aligned in Phase 4 |
| Icon | SFC | ✅ | — | core fixtures | shared source parsing; framework-specific Iconify adapters/cache |
| IconIndicator | SFC | ✅ | — | shared contract | controlled active state, pointer/keyboard activation, `aria-pressed`, and stable parts aligned in Phase 4 |
| InputAngle | SFC | ✅ | `inputRotary` | shared child contracts + rotary-snap + temporal | thin responsive composition of aligned InputRotary/InputNumber adapters |
| InputButton | SFC | ✅ | — | shared contract + text-toggles | action, native disabled state, invalid state, and stable content parts aligned in Phase 4 |
| InputButtonToggle | SFC | ✅ | — | shared contract | controlled activation, native disabled state, `aria-pressed`, and stable parts aligned in Phase 4 |
| InputCheckbox | SFC | ✅ | — | components-parity, text-toggles | |
| InputCode | SFC | ✅ | `codeEditor` | core diagnostic transform + dropdown-code | wrapper libraries differ; controlled value/cursor, cursor events, diagnostics, theme updates, key isolation, and async unmount guard aligned in Phase 4 |
| InputColor | SFC | ✅ | `color` | shared contract + core picker/tweak controllers + color-curves | controlled color synchronization, preset/EyeDropper confirm, SSR-safe capability detection, native disabled pad behavior, multi-selection channel transforms, stable overlay parts, and canonical pad styling aligned |
| InputComplex | SFC | ✅ | — | layout-modals | |
| InputCubicBezier | SFC | ✅ | `cubicBezier` | shared contract + core geometry + color-curves | controlled path, touch/pen/mouse handle drag, clamped point updates, disabled/invalid state, confirm lifecycle, and stable picker parts aligned in Phase 4 |
| InputDropdown | SFC | ✅ | `dropdown` | shared contract + components-parity, dropdown-code | shared empty/wrap navigation; click confirm, Escape rollback, and listbox ARIA aligned in Phase 4 |
| InputDrum | SFC | ✅ | `inputDrum` | shared contract + core controller + temporal | **done 2026-07-13**: controlled selection including SameValue/undefined options, keyboard/type-ahead, multi-step wheel input, disabled/invalid state, layout, drag math, stable parts, and canonical cross-browser masking/feedback are aligned |
| InputGroup | SFC | ✅ | — | shared contract + primitives | fragment/whitespace flattening and horizontal/vertical child positions aligned in Phase 4 |
| InputNumber | SFC | ✅ | `inputNumber` | shared contract + docs-pages, number-vectors | controlled edits, expressions, configured steps, disabled state, stable parts, decimal precision, and drag-scale protected |
| InputPosition | SFC | ✅ | `inputTranslate` | shared child contracts + number-vectors | forwards controlled bounds, disabled/invalid state, and lifecycle events to aligned InputTranslate/InputVec adapters |
| InputRadio | SFC | ✅ | `inputRadio` | text-toggles | **done 2026-07-13**: SameValue selection, controlled updates, object label associations, and focus/blur/confirm lifecycle run against both renderers; stable responsive-layout parts consume one shared rule set |
| InputRotary | SFC | ✅ | `inputRotary` | shared contract + core controller + rotary-snap + temporal | **done 2026-07-13**: continuous snap transition, shortest-angle and overlay geometry, native disabled/invalid state, controlled indicator, grouped positions, matching pointer hit areas, stable parts, and canonical CSS are aligned |
| InputShuffle | SFC | ✅ | `inputShuffle` | text-toggles | |
| InputSize | SFC | ✅ | `inputSize` | components-parity, number-vectors | shared aspect-lock controller; native disabled ratio button and `aria-pressed` aligned in Phase 4 |
| InputString | SFC | ✅ | `stringExpression` | text-toggles | expression compilation/coercion shared by both renderers |
| InputSwitch | SFC | ✅ | `inputSwitch` | text-toggles | drag-toggle overlay |
| InputTextBase | SFC | ✅ | — | — | internal base, not public API |
| InputTime | SFC | ✅ | `inputTime` | shared contract + temporal | core-owned expressions and tweak quantization; controlled display, bounds, keyboard increments, disabled/invalid state, digit selection, retained radial overlay, stable tick states, and canonical styling aligned |
| InputTranslate | SFC | ✅ | `inputTranslate` | shared contract + core geometry + number-vectors | bounded drag lifecycle, disabled/invalid state, overlay geometry, native button semantics, and stable parts aligned in Phase 4 |
| InputVec | SFC | ✅ | — | number-vectors | batched updates; disabled and invalid propagation aligned in Phase 4 |
| Markdown | SFC | ✅ | `markdown` | core pipeline + dropdown-code | synchronous SSR/client output, standard div root, options, anchors, definition lists, footnotes, and TOC shared in Phase 4 |
| Menu | SFC | ✅ | `menu` | shared contract + core safe-corridor geometry + overlay | command/short-label/separator rendering, close lifecycle, submenu corridor, shared public item types, and stable parts aligned in Phase 4 |
| MonacoEditor | SFC | ✅ | — | dropdown-code | `monaco-editor-vue3` vs `@monaco-editor/react` |
| MultiSelectPopup | SFC | ✅ | — | DOM controller fixtures + overlay | one shared selection/action controller; capture/update/confirm/dispose, popup cleanup, compatible action availability, keyboard button activation, feature-safe popover fallback, stable action states, and canonical styling aligned |
| PaneExpandable | SFC | ✅ | `panes` | shared controlled-state contract + layout-modals | controlled rejection, uncontrolled toggle, expand/collapse lifecycle, native expanded state, and stable trigger parts aligned in Phase 4 |
| PaneFloating | SFC | ✅ | `panes` | shared contract + core anchor controller + layout-modals | position persistence, edge/minimize transitions, titlebar-aware viewport clamp, composed dimension correction, shared pointer lifecycle, stable parts, and canonical anchor/resize/minimized styling aligned |
| PaneModal | SFC | ✅ | — | layout-modals | feature-safe native manual popover/top-layer with in-DOM fallback and outside-click emphasis |
| PaneModalComplex | SFC | ✅ | DOM modal delegate | layout-modals | prompt replacement/unmount settlement, cancel/save, nested-popover and multiline keyboard ownership aligned in Phase 4 |
| PaneModalTabs | SFC | ✅ | DOM modal delegate | layout-modals | stable API tab ids, live form values, cancel rollback, replacement/unmount settlement, and keyboard ownership aligned in Phase 4 |
| PaneSplit | SFC | ✅ | `panes` | shared contract + core resize controller + layout-modals | proportional/fixed first/fixed second movement, public minimum clamp, persistence, shared pointer lifecycle, and stable parts aligned in Phase 4 |
| PaneZUI | SFC | ✅ | `zui` + DOM gesture binding | core geometry + layout-modals | initial/controlled transform, pan/scroll/pinch graph, visible rect, size, dot state, and stable root aligned in Phase 4 |
| ParameterGrid | SFC | ✅ | app config persistence | shared ParameterGroup contract + layout-modals | grid/heading/slot layout plus native persistent group expand/collapse, group icons, expanded state, and stable parts aligned in Phase 4 |
| Popover | SFC | ✅ | `popover` | shared contract + core geometry + overlay | feature-safe CSS anchor/native lifecycle, controlled open state, coordinate placement, manual/auto mode, shift/arrow geometry, and stable parts aligned in Phase 4 |
| Ruler | SFC | ✅ | — | shared contract + core geometry + mobile-docs | default/custom scales, finite zero-size geometry, pointer mapping, and stable parts aligned in Phase 4 |
| SvgIcon | SFC | ✅ | `svgPath` | — | |
| Tabs | SFC | ✅ | `tabs` | shared contract + core selection + layout-modals | enabled persisted/default/fallback selection, custom storage keys, native disabled buttons, active/click lifecycle, id re-registration, ARIA, and stable parts aligned in Phase 4 |
| Timeline | SFC | ✅ | `timeline` | shared contract + core controller + temporal | native wheel pan/zoom, imperative range transitions, controlled frame width, scrollbar slot, and stable parts aligned in Phase 4 |
| TitleBar | SFC | ✅ | shared actions/menu stores | layout-modals | mouse/keyboard menu trigger, accessible button semantics, descendant focus/OS drag-region lifecycle, bind icons, and stable parts aligned in Phase 4 |
| Tooltip | SFC | ✅ | `tooltip` | DOM controller fixtures + Popover contract + overlay | one shared delay/anchor/snapshot state machine; plain/HTML/structured parsing, hover/focus handoff, native close synchronization, and stable content parts aligned in Phase 4 |
| TweakOverlay | SFC | ✅ | — | — | |
| TweeqProvider | SFC | ✅ | — | — | React-only name; Vue equivalent is `initTweeq` plugin |
| Viewport | SFC | ✅ | — | docs-pages, mobile-docs | style-scoping root (`.TqViewport`) |

## Non-component surface

| Surface | Vue | React | Target owner |
| --- | --- | --- | --- |
| `initTweeq` / `useTweeq` | plugin + composable | `initTweeq` + `useTweeq` hook | renderer adapters over shared store factories |
| Stores: actions, appConfig, modal, multiSelect, theme | Vue compatibility facades over shared stores | zustand-vanilla stores | **done 2026-07-13**: both renderers consume the `@tweeq/dom` instances; Vue adapters add refs and lifecycle disposal without duplicating state transitions |
| Theme generation | ~~`src/theme`~~ → shared | `core/theme` | **done 2026-07-13**: both renderers compute via `@tweeq/core` `computeTheme`, apply via `@tweeq/dom` `applyThemeToDOM`, and subscribe to the same `themeStore` |
| Composables/hooks: useBndr, useFlash, useDrag, useCursorStyle, … | `src/use` | `src/react/hooks` | thin adapters over `@tweeq/dom` controllers |
| Gesture engine | Vue ref adapter over `createDragHandler` | React hook over `createDragHandler` | **done 2026-07-13**: pointer state transitions and thresholds live in `@tweeq/dom`; renderer adapters only publish reactive snapshots and lifecycle disposal |
| Validators/formatting | ~~local copies~~ → shared | `core/validator`, `core/util` | **done 2026-07-13**: Vue's `util.ts`/`validator.ts` are re-export shims over `@tweeq/core`/`@tweeq/dom` |
| Styling | scoped Stylus per SFC + shared stable parts | CSS Modules per component + shared stable parts | **in progress**: `@tweeq/styles/shared.styl` owns the first primitive/control and lightweight wrapper families through stable component/part/state attributes; remaining renderer-local rules are tracked by MF-044 |

## Known intentional differences

1. **Controlled-value convention**: React `value`/`onChange` vs Vue
   `modelValue`/`update:modelValue`. Permanent, per architecture rule 2.
2. **Provider bootstrapping**: React `TweeqProvider`/`initTweeq` vs Vue plugin
   `initTweeq(app)`. Permanent.
3. **Monaco/Iconify wrappers**: framework-specific wrapper packages remain in
   each renderer.
4. **Store adapters**: both renderers use the shared zustand-vanilla stores.
   Vue exposes framework-native refs and lifecycle disposal around those same
   instances; its temporary Pinia compatibility layer was removed in Stage V4.
5. **Slots vs render props** for Menu, panes, ParameterGrid, Tooltip content.
   Permanent, per architecture rule 2.

### Converged during Phase 3

- `replaceTimecodeWithFrames`: legacy Vue parsed comma timecodes inside
  expressions at a hardcoded 24 fps; both renderers now use the shared core
  implementation, which honors the actual `frameRate` (fixture:
  `core/src/inputTime.test.ts`, `'1:00', 30 → '30'`).

## Protected fixtures (Phase 0)

These test files encode edge-case behavior that must not change without an
explicit parity-matrix entry. They migrate verbatim into `@tweeq/core` /
`@tweeq/test-contracts`:

- `src/core/inputNumber.test.ts` — decimal precision, drag scaling, ranges
- `src/core/inputTime.test.ts` — timecode parsing, frame quantization
- `src/core/inputRotary.test.ts`, `src/core/inputDrum.test.ts` — angular/drum
  transitions and snapping
- `src/core/inputSize.test.ts`, `src/core/inputTranslate.test.ts`,
  `src/core/inputSwitch.test.ts`, `src/core/inputShuffle.ts` fixtures
- `src/core/dropdown.test.ts`, `src/core/menu.test.ts` — selection semantics
- `src/core/color.test.ts`, `src/core/cubicBezier.test.ts`
- `src/core/popover.test.ts`, `src/core/balloon.test.ts`,
  `src/core/panes.test.ts`, `src/core/timeline.test.ts`,
  `src/core/geometry.test.ts`, `src/core/drag.test.ts`
- `src/core/stores/appConfig.test.ts` — persistence namespacing
- `e2e/*.spec.ts` — 13 Playwright specs (interaction-level baseline)

## Deletion checklist (Stage V4)

Track compatibility code here instead of TODO comments. Format: item,
introduced-in, removal criteria, status.

| Item | Introduced | Removal criteria | Status |
| --- | --- | --- | --- |
| `packages/react/src/core/index.ts` barrel forwarding `@tweeq/core` + `@tweeq/dom` | Phase 2 (React relocation) | every React source imports the owner explicitly; renderer entry preserves convenience exports directly from the owning packages | **done 2026-07-13**: all internal consumers migrated and the local barrel deleted |
| `packages/react/src/common.styl` stylus forwarder to `@tweeq/styles` | Phase 2 (React relocation) | no renderer stylesheet imports the forwarder; source-building Vite configs inject the owned mixins by absolute path | **done 2026-07-13** via shared `scripts/vite-stylus.ts` configuration |
| `packages/vue/src/common.styl` stylus forwarder to `@tweeq/styles` | Phase 2 (Vue relocation) | no renderer stylesheet imports the forwarder; source-building Vite configs inject the owned mixins by absolute path | **done 2026-07-13** via shared `scripts/vite-stylus.ts` configuration |
| Pinia stores and component-local contexts in `packages/vue` | upstream legacy, kept in Stage V1 | app stores use shared instances; local contexts become plain Vue/module state; `rg "pinia\|defineStore\|createPinia" packages/vue apps/playground-vue examples/vue-vite` is empty | **done 2026-07-13**: actions, appConfig, modal, multiSelect, and theme share DOM stores; InputTime and regl no longer require Pinia |
| Duplicated pure logic in `packages/vue/src/` (`util.ts`, `validator.ts`, `theme/`, per-component `utils.ts`) | upstream legacy, kept in Stage V1 | Vue and React call the shared core/controller implementations without copied transitions | **done 2026-07-13** for util, validator, theme, timecode, CubicBezierValue, InputShuffle, InputColor, InputSwitch, and InputRotary |
| Re-export shims left by Stage V2 (`packages/vue/src/{util,validator}.ts`, `InputTime/utils.ts` function re-exports, `InputCubicBezier/util.ts`, `InputShuffle/generators.ts`) | Phase 3 leaf replacement | Vue callers import owning packages directly; shim files deleted when `rg "from '\.\./(util|validator)'" packages/vue/src` is empty | **done 2026-07-13**: public compatibility exports now forward from the package entry points without renderer-local files |
| Legacy vue-tsc diagnostics in `@tweeq/vue` build (non-fatal, pre-existing upstream typing issues) | Stage V1 build restoration | declaration generation completes without TypeScript diagnostics | **done 2026-07-13**: recursive Menu refs/props, readonly color axes, generic vector bounds, event overloads, and element/style typing corrected |

## Phase 4 family status

| Family | Status | Evidence |
| --- | --- | --- |
| 1. primitives, icons, groups, buttons, switches | **done 2026-07-13** | shared contracts run against both renderers for InputButton, InputButtonToggle, InputSwitch, InputCheckbox, InputGroup, and IconIndicator; Icon source parsing has core fixtures; BindIcon/SvgIcon remain renderer-only markup; packed examples and relevant Playwright specs pass |
| 2. text and dropdown controls | **done 2026-07-13** | InputString and InputDropdown shared contracts run against both renderers; expression compilation, label generation, placement, and wrap/empty navigation are core-owned; packed examples and text/dropdown Playwright specs pass |
| 3. number and vector controls | **done 2026-07-13** | InputNumber and InputTranslate shared contracts run against both renderers; expression evaluation, translate geometry, and size ratio behavior are core-owned; InputVec and InputPosition propagate controlled bounds and input state consistently; number/vector Playwright coverage protects the composed controls |
| 4. rotary, angle, drum, ruler, time, timeline | **done 2026-07-13** | shared contracts run against both renderers for InputTime, InputDrum, InputRotary, Ruler, and Timeline; InputAngle composes contracted controls; expression, snap/drag, selection, scale, and range transitions are core-owned; temporal and rotary Playwright coverage passes |
| 5. popover, tooltip, menus, command palette, multi-select | **done 2026-07-13** | Menu and Popover shared contracts run against both renderers; Tooltip and MultiSelect state machines are DOM-owned with controller fixtures; CommandPalette history/navigation is core-owned and actions preserve shared lifecycle hooks; overlay/dropdown Playwright coverage passes |

## Retrospective gate repair (2026-07-13)

The Phase 0–2 completion audit found that Vite-based consumers had masked
bundler-only ESM resolution and Vue import-time browser effects. Core and DOM
now emit Node-resolvable `.js` specifiers; Vue defers WebGL and Monaco browser
initialization, no longer imports the SSR-unsafe Pave package, and excludes
contract tests from declarations. CI now runs plain-Node entry imports, the
full Playwright suite, and representative light/dark/mobile screenshots.

## Stage V1 completion note (2026-07-13)

The Vue renderer builds again as `@tweeq/vue` (ES + CJS + browser UMD + `style.css` +
declarations). The original relocation baseline was verified with shared-asset
seams for InputColor shaders and Stylus; later stages replaced those temporary
seams with owned package imports and shared Vite injection. Verified by
`apps/playground-vue` booting with zero console errors and by the packed
`examples/vue-vite` build.
