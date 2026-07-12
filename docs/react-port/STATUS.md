# React Port — Status Log (append-only)

Newest entries at the bottom. Every agent appends after finishing (or abandoning) a batch:
date · agent · what was done · deviations from PLAN/CONVENTIONS · exact next steps if work is unfinished.

---

## 2026-07-12 · orchestrator (Claude)

- Created branch `react-port`.
- Wrote PLAN.md, CONVENTIONS.md, this file.
- Launched background survey agent to produce INVENTORY.md.
- Toolchain scaffolded and verified working end-to-end:
  - deps added: react 19, react-dom, zustand 5, @iconify/react, @monaco-editor/react, @types/react(-dom), @vitejs/plugin-react@4 (v6 needs vite 6; repo is on vite 5), @playwright/test.
  - Playwright chromium on this WSL2 box needs extra system libs; they are extracted (no root) to `~/.cache/ms-playwright/local-libs` and injected via `LD_LIBRARY_PATH` in the `e2e` npm script. If browsers are re-installed elsewhere, re-run: `apt-get download libatk1.0-0 libatk-bridge2.0-0 libgbm1 libatspi2.0-0 libwayland-server0`, `dpkg -x` each, copy `usr/lib/x86_64-linux-gnu/*.so*` into that dir.
  - `demo/` React playground (own vite.config.ts with plugin-react), `e2e/smoke.spec.ts` passing via `npm run e2e`; `npm run dev:demo` serves on :5174.
- Next: Phase 1 (core extraction) once INVENTORY.md lands.

## 2026-07-12 · Phase 1 agent (Claude)

**Done: Phase 1 — core extraction.** New tree `src/core/` (no vue/pinia/@vueuse/react imports; verified by grep). All gates green: `npx tsc -p tsconfig.json --noEmit`, `npx eslint src/core`, `npx vitest run` (50 tests, incl. snapshots), grep clean.

- `src/core/theme/`: `types.ts`/`palette.ts`/`radix.ts` copied verbatim (they were already framework-free). New `computeTheme.ts` (settings → `{theme, monacoTheme}`, extracted from the legacy theme store's computeds) and `applyThemeToDOM(theme, colorMode, root = document.body)` (CSS `--tq-*` vars + `data-color-mode` + `<meta name=theme-color>`).
- `src/core/stores/` (vanilla zustand, `createStore` from `zustand/vanilla`; actions live **in** the store state for pinia-like call sites, e.g. `themeStore.getState().setDefault(...)`):
  - `appConfig.ts` — `ConfigEntry` (`.value`/`.default` accessors, `subscribe`) + `ConfigGroup` (`ref`/`group`/`reset`), persistence semantics preserved exactly (JSON under `"${appId}.${path}.${name}"`, default values un-persist, default-change follows/un-persists per legacy).
  - `theme.ts` — state = 4 settings + every `Theme` token spread at top level (like legacy `toRefs(toReactive(theme))`) + `theme` object + `monacoTheme`; persists via appConfig group `theme`; subscribes and applies CSS vars automatically on import (browser only; waits for DOMContentLoaded if `document.body` isn't there yet). `setDefault(options)` semantics kept.
  - `actions.ts` — `Action`/`ActionGroup`/`ActionItem(Options)` types kept; bndr-js hotkey/gamepad binding kept (incl. `?repeat`, `gamepad:` prefixes, SSR guards); menu building (order-sort + extras) kept.
  - `modal.ts` — prompt/promptTabs/registerPrompt/registerPromptTabs, same NO_UI error.
  - `multiSelect.ts` — full port: click-order selection, shift range-select via Rect math, modifier-aware defocus (outside pointerdown/Escape/Tab), capture/update/confirm flows.
- `src/core/drag.ts` — `createDragHandler(element, options): {state, measure, dispose}`; all `useDrag` options/behaviors preserved (drag delay, 3px mouse / 5px touch thresholds, `shouldDrag` gate, pointer capture on the stable target, pointer-lock, zoom-scaled `movementX/Y`).
- `src/core/{util,validator}.ts` copied verbatim (`util.ts` had **no** Vue imports — nothing dropped). `types.ts` ported; `menu.ts` new (see below). `index.ts` re-exports the public surface (validators namespaced as `validator`).
- Tests: `validator.test.ts`, `util.test.ts`, `theme/computeTheme.test.ts` (light+dark snapshots + invariants), `stores/appConfig.test.ts` (persistence/defaults/reset/re-key with in-memory localStorage), `drag.test.ts` (state machine with a fake EventTarget element).

**Semantic deviations from legacy (explicit list):**
1. appConfig: entries resolve their storage key **dynamically** from the current appId and reload from localStorage on `setAppId` (legacy pinia was lazy, so keys were fixed at first access after `initTweeq`; eager zustand init needs the re-key). Entry subscribers receive `(value, {reload})`.
2. appConfig: `ref()` returns a **shared** entry per key (legacy created independent refs per call). Persistence is synchronous (legacy Vue watchers batched per tick). `reset()` still only clears storage, not in-memory values (as legacy).
3. theme: the colorMode→background snap is **skipped** for `{reload: true}` notifications so restoring a saved colorMode on `setAppId` can't clobber a saved custom background (legacy never hit this path). Bundled `theme: Theme` object added to state (new, used by the DOM applier/provider).
4. Vue lifecycle hooks → disposers: `actions.register`, `actions.onBeforePerform`, and multiSelect's handle (`dispose()`) return cleanup functions instead of `onBeforeUnmount`/`onUnmounted`.
5. multiSelect: source refs → getters (`getElement`, `getSpeed`), focus reported via `handle.setFocusing(bool)`; `subfocus`/`index`/`readyToBeSelected`/`multiSelected` are getters (subscribe to the store for reactivity); modifier keys tracked by window keydown/keyup/blur (replaces `useMagicKeys`; cleared on window blur — new); global listeners attach lazily on first `register`; `dispose` also removes the id from `selectedIds` (legacy left stale symbols and filtered on read).
6. modal: `Scheme` → structural `ModalScheme` (the real Scheme is built from component prop types and stays in the component layer; Phase 3's InputComplex narrows it). `ModalComponentTab.component` is `unknown` (was Vue `Component`).
7. types: `InputEmits` → `InputEvents` (`onFocus`/`onBlur`/`onConfirm` callbacks); `useLabelizer` → pure `getLabelizer()`; HSVA/HSV/RGB/RGBA copied in; `MenuItem`/`MenuCommand`/`MenuGroup`/`MenuSeparator` extracted from `Menu.vue` into `core/menu.ts`.
8. drag: `MaybeRef` options → `boolean | (() => boolean)`; bounds are measured on pointerdown/every move + exposed `measure()` (legacy `useElementBounding` also refreshed on scroll/resize outside drags — the Phase 2 React hook must re-measure/observe if a consumer reads bounds outside a gesture, e.g. InputNumber's bar width).
9. actions: `markRaw` dropped (no reactivity system); disposing a registration removes actions/binds but leaves menu entries in place (same as legacy).

**Toolchain (files outside src/core touched, with justification):**
- `tsconfig.json`: `include` narrowed `["src"]` → `["src/core"]` — the legacy tree has never typechecked under plain `tsc` (unresolvable `.vue` imports, no shims). Phase 2 must add `"src/react"` (and `demo`/`e2e` once `demo/DemoApp.tsx` gets `vite/client` types for `import.meta.glob`).
- `vite.config.ts`: added `test.exclude` for `e2e/**` — `npx vitest run` was failing by collecting the Playwright spec (pre-existing scaffolding collision).

**Open TODOs for Phase 2:**
- `initTweeq(appId, options)` equivalent = `appConfigStore.getState().setAppId(appId)` + `themeStore.getState().setDefault(options)`; the `colorPresets` part lives in Vue-bound `useInputColor` — port alongside InputColor (Batch 6).
- React adapters: `useStore(themeStore, selector)`, `useDrag` wrapping `createDragHandler` (re-create on element/options change; add live bounds), multiSelect hook wiring `setFocusing` + store subscription, `useConfigRef` over `ConfigEntry.subscribe`.
- Legacy `getSelectedInputs()[i].speed` is a getter property on `MultiSelectInput` — popup code can keep `input.speed ?? 1`.

## 2026-07-12 · Phase 2 agent (Codex)

**Done: Phase 2 — React infrastructure + primitives.** Added `src/react/` with its public `index.ts`, initialization/store hooks, reusable DOM adapters, CSS-Module components, demo sections, and Playwright coverage. All required gates are green: TypeScript, ESLint, 50 Vitest tests, and 2 Playwright tests.

- Infrastructure: `initTweeq` initializes app config + theme defaults; `TweeqProvider` does so once before rendering children and imports the legacy globals; `useTweeq` subscribes to theme/actions/config/modal through zustand. The provider has an explicit seam for CommandPalette, MultiSelectPopup, PaneModalComplex/Tabs, and TooltipRoot.
- Hooks: `useDrag` wraps the core handler, publishes React snapshots, rebinds on element/options identity, and keeps bounds live via ResizeObserver + capturing scroll/window resize; `useBndr`, `useCopyPaste`, `useValidator` (render-synchronous last-valid state), `useCursorStyle`, `useElementCenter`, `useFlash`, `useConfigRef`, and `useMultiSelect` are public. Reusable `useElementBounding`, `useResizeObserver`, `useEventListener`, and `useFocus` replace the vueuse APIs needed now; `useKeys`/`useWindowSize` remain demand-driven for later batches.
- Primitives: Icon (Iconify cache plus `char:`/`fill:`), SvgIcon, ColorIcon, BindIcon, IconIndicator, InputGroup, TweakOverlay, and Viewport. Viewport keeps reset styles in its CSS Module and fixed-name scroll-fade globals in a separate global Stylus file.
- Demo/e2e: one auto-discovered section per primitive; the demo root is under TweeqProvider. `e2e/primitives.spec.ts` proves body theme variables, local Iconify + fill SVG output, InputGroup positions, top-layer popover state, and IconIndicator interaction.
- Toolchain: `tsconfig.json` now includes `src/core`, `src/react`, and `demo`; `demo/vite-env.d.ts` supplies Vite glob types.

**Contracts / deviations for later batches:**
1. Pass a memoized/stable options object to `useDrag`; by design, a changed options identity recreates the core gesture handler. It returns a flat `UseDragResult` snapshot plus `measure()` rather than Vue refs. Bounds remain current outside gestures.
2. `useMultiSelect(source, focusing?)` subscribes to the whole store. Prefer calling its returned `setFocusing` directly at focus/tweak event sites for sync semantics; the optional boolean is layout-effect synchronization. Missing speeds remain missing so popup consumers keep `input.speed ?? 1`.
3. `useConfigRef(entry)` returns `[value, setValue]` and subscribes using the Phase 1 `(value, {reload})` signature. `useValidator(value, validator)` validates during render so model/local/display loops do not wait for an effect.
4. Every component used in InputGroup must accept `inlinePosition`/`blockPosition` and translate/forward them to the root DOM attributes (`inline-position`/`block-position`, or equivalent selectors). InputGroup recursively flattens fragments before cloning.
5. Full-screen tweak UI must use `TweakOverlay`: its manual popover is shown in an effect and supplies the browser top-layer escape pattern (no ReactDOM portal is required).
6. Per scope, color presets stay deferred to InputColor, and the five provider-mounted overlay/modal roots stay deferred until their component batches / final Batch 8 wiring.

## 2026-07-12 · Batch 2 agent (Codex)

**Done: overlay stack — Balloon, Popover, Tooltip, Menu.** The React public entry exports all four components plus `TooltipRoot`/`useTooltip`; TweeqProvider now mounts the shared tooltip root. Core now owns tested Balloon path generation, Popover CSS-anchor/viewport-shift geometry, Menu's safe-triangle predicate, and the framework-neutral shared tooltip store. Gates: TypeScript + ESLint clean, 56 Vitest tests, 3 Playwright tests.

- Popover keeps native `popover` semantics (`auto` for light dismiss, `manual` otherwise), generated/refcounted anchor names, CSS Anchor Positioning, flip fallbacks, cross-axis viewport shift, arrow geometry after flips, optional top-layer portal target, and allow-discrete exit styling.
- Tooltip's hook moves the fixed anchor before its 200 ms show delay, handles hover + focus, live-updates content, and cleans shared state/anchors on replacement or unmount. `TooltipRoot` portals into `.TqViewport` when present; Viewport now carries that stable global class in addition to its CSS-Module class.
- Menu is recursive with an imperative `getRoot()` handle for the safe corridor, theme-derived submenu offset, command/bind/icon rendering, and close propagation.
- Demo/e2e sections cover measured Balloon SVG, controlled anchored Popover, shared structured Tooltip, and a working Menu command.

**Next-batch contracts:** use `Popover` rather than introducing a positioning dependency; pass a real reference element and controlled `open`/`onChangeOpen`. Components that need directive-style help text should call `useTooltip(ref, value)`. TooltipRoot is already provided globally and must not be mounted again by individual controls.

## 2026-07-12 · Batch 3 agent (Codex)

**Done: text & toggles — InputTextBase, InputString, InputButton, InputButtonToggle, InputSwitch, InputCheckbox, InputRadio, InputShuffle.** All are controlled React components with CSS Modules and public prop/handle types. Core gained tested switch decision helpers, string-expression compilation, and the legacy shuffle generators. Gates: TypeScript + ESLint clean, 60 Vitest tests, 4 Playwright tests.

- InputTextBase preserves synchronous typing propagation rules, focus state callbacks, Enter confirmation, imperative select/blur/root/input access, icon/inactive render seams, and coordinate-placed context menus.
- InputString keeps local/display/controlled separation, synchronous validation at event sites, expression mode (`⌘=` with `{i}`), multi-select capture/update/confirm, reset, and imperative select/blur.
- InputButton supports truncation-derived tooltip fallback and imperative flash; InputButtonToggle is controlled. Mouse-down focus suppression remains while keyboard focus/activation still works.
- InputSwitch/InputCheckbox share one hook for click-vs-drag, true/false key families, native input events, confirmation, and multi-select. InputRadio keeps measured row/icon/column modes, sliding indicator, drag-to-select, render-option seam, and per-option tooltips. InputShuffle preserves dice flair and generic generators.
- Demo/e2e exercises text entry and one controlled interaction for every batch component.

**Next-batch contracts:** InputNumber should build on `InputTextBase` and its `InputTextBaseHandle`, not duplicate text/context-menu behavior. Use event-site local/display updates like InputString to avoid caret flashes. Inputs used inside InputGroup must consume `inlinePosition`/`blockPosition` and emit the corresponding root attributes. Switch controls already participate in multi-select through the shared hook.

## 2026-07-12 · Batch 4 agent (Codex)

**Done: InputNumber + vectors — InputNumber, InputVec, InputSize, InputTranslate, InputPosition.** Core owns tested precision derivation, numeric expression compilation, scrub sensitivity/axis weighting, ratio-preserving size edits, and translate overlay geometry. Gates: TypeScript + ESLint clean, 67 Vitest tests, 5 Playwright tests.

- InputNumber preserves controlled/local/display separation, range/bar/scales, step/snap/clamp validation, prefix/suffix display, reset, arrow keys, `⌘=`/implicit numeric expressions with `{i}`, multi-select speed/capture/update/confirm, absolute ranged drags, relative scrub zones, pointer lock for unbounded values, vertical speed adjustment, Alt/Shift/Q modifiers, and live out-of-range affordances.
- `useKeys` is now a reusable exported replacement for the needed vueuse key tracking and clears state on window blur.
- InputVec microtask-coalesces per-axis changes and confirmations so simultaneous multi-select updates cannot overwrite sibling axes. InputSize keeps ratio lock and drops it on disproportionate two-axis edits.
- InputTranslate keeps pointer-lock 2D dragging, X/Y axis constraints, Alt/Shift speed/grid changes, bounds, animated overlay grid/label, and confirm/focus lifecycle. Its grid easing runs only until it reaches the target instead of a permanent rAF loop. InputPosition composes translate + numeric axes through InputGroup.
- Demo/e2e covers typed numeric/vector updates, ratio lock, InputPosition, and a real ranged InputNumber drag; InputTranslate receives a render smoke check because Playwright mouse automation stalls after Chromium pointer lock, while its math is unit-tested.

**Next-batch contracts:** temporal controls can reuse InputTextBase's local/display pattern and `compileNumberExpression` as a model for their own context. All drag options in this batch are stable objects with mutable callback refs—preserve that pattern or a React render will recreate an active core drag handler. InputVec is the canonical coalescing wrapper for axis tuples.

## 2026-07-12 · Batch 5 agent (Codex)

**Done: temporal/rotary — InputRotary, InputAngle, InputTime, InputDrum, Ruler, Timeline.** Core now owns tested timecode parsing/formatting/expression compilation, persisted time format entry, rotary angle/viewport geometry, drum cell sizing, and timeline clamping/reveal math. Gates: TypeScript + ESLint clean, 74 Vitest tests, 6 Playwright tests.

- InputRotary keeps absolute/relative modes (pointer + A/R), shortest-angle and multi-revolution arcs, radial snap meter, Shift/Q/radius snapping, multi-select relative/absolute updates, copy/paste, hidden cursor, constrained top-layer label, and confirmation. InputAngle responsively composes Rotary + Number using the live theme input height.
- InputTime keeps frames/timecode display formats persisted through appConfig, unit/timecode expressions with `{i,fps}`, digit hover scales, H/M/S/T and Alt/Shift/Q modifiers, pointer-lock tweak, multi-select, format context menu, reset/hotkeys, and the top-layer radial meter/hands.
- InputDrum preserves measured uniform cells, gap cap, pointer-lock fractional scrubbing, click/wheel/arrow/type-ahead selection, external-value animation, and InputGroup positions. Ruler retains bndr offset dragging.
- Timeline exposes `showRange`/`centerFrame`, render-prop range helpers, visible range, overscroll clamp, pan, Alt-wheel zoom-about-cursor, debounced confirm, and scrollbar position. React's wheel event supplies the same coordinate/modifier data directly; no new gesture dependency was introduced.
- Demo/e2e verifies InputAngle, time expressions, drum keys, rotary rendering, and Timeline zoom. Pointer-lock paths share the already unit-tested drag core.

**Next-batch contracts:** `inputTimeFormatEntry` is the sole persisted display-format source; future modal/menus should use `useConfigRef` rather than create another context. Timeline consumers receive all Vue scoped-slot fields through the `children` render prop. Rotary/Time overlays must remain inside TweakOverlay to escape containing blocks.
