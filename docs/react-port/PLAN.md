# Tweeq React Port — Master Plan & Handoff Doc

> **Audience:** any agent (Claude Code subagent, Codex, or human) picking up this work.
> **Branch:** `react-port`. Commit after each completed batch; never commit to `main`.
> **Status tracking:** see the checklist at the bottom + `STATUS.md` (append-only log).
> **Codebase inventory:** `INVENTORY.md` (per-component deps, difficulty, gotchas). Read it before porting anything.
> **Authoring rules:** `CONVENTIONS.md`. Follow them exactly so components stay uniform.

## Goal

Tweeq is a Vue 3 GUI toolkit for creative tools (`src/*` = ~50 components, pinia stores, composables, Stylus themes). We are producing a **React version**, extracting framework-agnostic logic into a core layer. **Vue support may be dropped**; the old `.vue` sources remain in place during the port purely as reference.

## Target architecture

```
src/
  core/           # NO framework imports (no vue, no react). Pure TS + DOM.
    stores/       # vanilla zustand stores: theme, actions, appConfig, modal, multiSelect
    theme/        # palette generation (radix-colors based), CSS var emission
    drag/         # drag/scrub state machine extracted from use/useDrag.ts (bndr-js based)
    ...           # util.ts, types.ts, validator.ts, color logic, parsing/formatting
  react/          # React 18+ components; thin rendering over core
    components/   # one dir per component, mirroring src/<Name>/
    hooks/        # useDrag, useBndr, useCopyPaste, ... (React adapters over core)
    index.ts      # public entry: exports components + initTweeq/useTweeq equivalents
  <Name>/         # LEGACY Vue components — reference only, do not edit
```

## Locked-in decisions

| Concern | Decision |
|---|---|
| State | **zustand v5**: `createStore` (vanilla) in `src/core/stores`, consumed in React via `useStore`. Replaces pinia. |
| Icons | `@iconify/react` replaces `@iconify/vue`. Keep the same `Icon` component API (string `icon` prop, supports `material-symbols:...` etc.). |
| Monaco | `@monaco-editor/react` replaces `monaco-editor-vue3`. |
| Gestures/input | `bndr-js` stays (framework-agnostic). `@vueuse/gesture` and `@vueuse/core` usages get replaced by core logic + small React hooks — do **not** add a vueuse-like React kitchen-sink dep. |
| Styles | Scoped `.styl` blocks in `.vue` files → **CSS Modules** (`<Name>.module.styl`). `common.styl` + theme CSS custom properties (`--tq-*`) stay as-is. |
| v-model | Vue `modelValue`/`update:modelValue` → React `value` + `onChange(value)` (controlled-only). See CONVENTIONS.md. |
| Build | Vite lib build with `@vitejs/plugin-react`; entry `src/react/index.ts`. `react`/`react-dom` are peerDependencies (>=18). Vue build targets can break/be removed — that's fine. |
| Tests | Existing vitest tests for pure logic move with the code into `src/core`. New core modules get unit tests where logic is nontrivial (drag math, parsing, theme). |
| E2E | **Playwright** (`@playwright/test`, chromium) against the demo playground (`demo/`, vite React app). Each batch adds a demo page section + at least a smoke test (renders, basic interaction fires `onChange`). Installing extra deps (npm or native) for testing is allowed. |

## Phases

1. **Phase 1 — core extraction** (blocks everything): port stores to vanilla zustand, move `theme/`, `util.ts`, `types.ts`, `validator.ts` into `src/core`, extract `useDrag` state machine.
2. **Phase 2 — React infra**: `TweeqProvider` (theme CSS vars, appId, global styles), `Icon`, hooks (`useBndr`, `useDrag`, `useCopyPaste`, ...), `initTweeq`/`useTweeq` equivalents.
3. **Phase 3 — components in batches** (see checklist; batch composition comes from INVENTORY.md's dependency order).
4. **Phase 4 — build/demo/cleanup**: vite build for the React lib, a demo page exercising every component, drop dead Vue deps.

## How to work on a batch (for agents)

1. Read `INVENTORY.md` entry + the legacy Vue source for your components.
2. Port per `CONVENTIONS.md`. Reuse `src/core` — if you need logic that lives in a `.vue` file, extract it to core first.
3. Typecheck (`npx tsc -p tsconfig.json --noEmit`) and run `npx vitest run` for anything you added tests for. `npm run lint` must pass for files you touched.
4. Tick your batch in the checklist below, append a dated entry to `STATUS.md` (what was done, deviations, TODOs).
5. Commit on `react-port` with message `react-port: <batch name>`.

## Batch checklist

Filled in after INVENTORY.md lands. States: `[ ]` todo · `[~]` in progress (note owner in STATUS.md) · `[x]` done.

- [x] Phase 1: core extraction (stores, theme, util/types/validator, drag core)
- [x] Phase 2: React infra (TweeqProvider shell, useTweeq/initTweeq, hooks: useBndr/useDrag/useCopyPaste/...) + primitives batch: Icon, SvgIcon, ColorIcon, BindIcon, IconIndicator, InputGroup, TweakOverlay, Viewport
- [x] Batch 2: overlay stack — Balloon, Popover, Tooltip, Menu (native Popover API + CSS anchor positioning; see INVENTORY risks)
- [x] Batch 3: text & toggles — InputTextBase, InputString, InputButton, InputButtonToggle, InputSwitch, InputCheckbox, InputRadio, InputShuffle
- [x] Batch 4: InputNumber (very hard, 918 LOC) + vectors — InputVec, InputSize, InputTranslate, InputPosition
- [x] Batch 5: temporal/rotary — InputRotary, InputAngle, InputTime, InputDrum, Ruler, Timeline
- [ ] Batch 6: dropdown/palette/code — InputDropdown, CommandPalette, MultiSelectPopup, MonacoEditor, InputCode, Markdown (before Batch 7: InputColor's channel values need InputDropdown)
- [ ] Batch 7: color/GL/curves — GlslCanvas, InputColor (very hard, 1741 LOC), InputCubicBezier
- [ ] Batch 8: panes/layout/complex — Tabs, ParameterGrid, InputComplex, PaneModal, PaneModalComplex, PaneModalTabs, PaneSplit, PaneExpandable, PaneFloating, PaneZUI, TitleBar, App, final TweeqProvider wiring
- [ ] Phase 4: build config (lib entry `src/react/index.ts`), demo covers all components, dependency cleanup (drop vue deps + unused: @vueuse/gesture, monaco-themes, fp-ts, @material/material-color-utilities), final lint/typecheck/e2e

## Parallel work rule

When multiple batch agents run concurrently in this worktree: only the orchestrator commits, and concurrent agents must NOT edit shared files (PLAN.md, STATUS.md, package.json, demo/DemoApp.tsx, src/react/index.ts). Instead each agent writes `docs/react-port/status/<batch>.md` + demo sections as `demo/sections/<Name>Section.tsx` (default-export a component; auto-discovered via import.meta.glob, no registration needed) and lists required shared-file edits (e.g. src/react/index.ts exports) in its status note; the orchestrator merges them. Agents running alone may edit shared files and commit directly.

## Usage-limit protocol

If you (an agent) are running low on context/usage: STOP starting new work, finish or revert the file you're mid-way through, update `STATUS.md` with exact next steps (file paths, what's half-done), and commit with `react-port: WIP <what>`.
