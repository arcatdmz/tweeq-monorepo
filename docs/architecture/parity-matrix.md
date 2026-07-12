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
| App | SFC | ✅ | — | layout-modals | App shell; depends on stores, TitleBar, CommandPalette |
| Balloon | SFC | ✅ | `balloon` | — | |
| BindIcon | SFC | ✅ | — | — | |
| ColorIcon | SFC | ✅ | — | — | |
| CommandPalette | SFC | ✅ | — | dropdown-code | fuzzy search via `fast-fuzzy` in both |
| GlslCanvas | SFC | ✅ | `glsl` | color-curves | regl-based; WebGL feature detection |
| Icon | SFC | ✅ | — | — | `@iconify/vue` vs `@iconify/react` |
| IconIndicator | SFC | ✅ | — | — | |
| InputAngle | SFC | ✅ | (`inputRotary`) | rotary-snap, temporal | wraps rotary semantics |
| InputButton | SFC | ✅ | — | text-toggles | stateless; types/styles sharing only |
| InputButtonToggle | SFC | ✅ | — | — | |
| InputCheckbox | SFC | ✅ | — | components-parity, text-toggles | |
| InputCode | SFC | ✅ | — | dropdown-code | Monaco integration differs by wrapper lib |
| InputColor | SFC | ✅ | `color` | color-curves | popover + channel sliders/pad |
| InputComplex | SFC | ✅ | — | layout-modals | |
| InputCubicBezier | SFC | ✅ | `cubicBezier` | color-curves | |
| InputDropdown | SFC | ✅ | `dropdown` | components-parity, dropdown-code | |
| InputDrum | SFC | ✅ | `inputDrum` | temporal | |
| InputGroup | SFC | ✅ | — | primitives | |
| InputNumber | SFC | ✅ | `inputNumber` | docs-pages, number-vectors | decimal precision + drag-scale fixtures protected |
| InputPosition | SFC | ✅ | (`inputTranslate`) | number-vectors | |
| InputRadio | SFC | ✅ | — | text-toggles | |
| InputRotary | SFC | ✅ | `inputRotary` | temporal | |
| InputShuffle | SFC | ✅ | `inputShuffle` | text-toggles | |
| InputSize | SFC | ✅ | `inputSize` | components-parity, number-vectors | aspect-lock semantics |
| InputString | SFC | ✅ | — | text-toggles | |
| InputSwitch | SFC | ✅ | `inputSwitch` | text-toggles | drag-toggle overlay |
| InputTextBase | SFC | ✅ | — | — | internal base, not public API |
| InputTime | SFC | ✅ | `inputTime` | temporal | timecode / frame quantization fixtures protected |
| InputTranslate | SFC | ✅ | `inputTranslate` | number-vectors | |
| InputVec | SFC | ✅ | — | number-vectors | |
| Markdown | SFC | ✅ | — | dropdown-code | markdown-it pipeline shared |
| Menu | SFC | ✅ | `menu` | overlay | |
| MonacoEditor | SFC | ✅ | — | dropdown-code | `monaco-editor-vue3` vs `@monaco-editor/react` |
| MultiSelectPopup | SFC | ✅ | — | — | multi-select store |
| PaneExpandable | SFC | ✅ | `panes` | layout-modals | |
| PaneFloating | SFC | ✅ | `panes` | layout-modals | position persistence |
| PaneModal | SFC | ✅ | — | layout-modals | native popover/top-layer |
| PaneModalComplex | SFC | ✅ | — | — | |
| PaneModalTabs | SFC | ✅ | — | — | |
| PaneSplit | SFC | ✅ | `panes` | — | |
| PaneZUI | SFC | ✅ | — | layout-modals | zoomable UI |
| ParameterGrid | SFC | ✅ | — | — | grid layout + ParameterHeading |
| Popover | SFC | ✅ | `popover` | — | CSS anchor + native popover |
| Ruler | SFC | ✅ | — | mobile-docs | |
| SvgIcon | SFC | ✅ | `svgPath` | — | |
| Tabs | SFC | ✅ | — | layout-modals | |
| Timeline | SFC | ✅ | `timeline` | temporal | |
| TitleBar | SFC | ✅ | — | — | |
| Tooltip | SFC | ✅ | `tooltip` | — | shared delay/anchor state machine |
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
| Styling | scoped Stylus per SFC + `common.styl` | CSS Modules per component | `@tweeq/styles` parts (Phase 3+) |

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

## Stage V1 completion note (2026-07-13)

The Vue renderer builds again as `@tweeq/vue` (ES + UMD + `style.css` +
declarations). The original relocation baseline was verified with shared-asset
seams for InputColor shaders and Stylus; later stages replaced those temporary
seams with owned package imports and shared Vite injection. Verified by
`apps/playground-vue` booting with zero console errors and by the packed
`examples/vue-vite` build.
