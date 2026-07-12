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
