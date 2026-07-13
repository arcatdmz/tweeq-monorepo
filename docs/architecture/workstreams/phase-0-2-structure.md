# Workstream status: Phases 0–2 (baseline, workspace, relocation) + Phase 3 leaf tier

Status: **Phases 0–5 complete; Phase 6 prerelease preparation and cleanup in progress** (2026-07-13)
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
  `apps/playground-react` and `apps/playground-vue` added. Their exhaustive
  galleries are mechanically checked against all 53 React and 48 Vue public
  component modules and browser-smoked. The docs `#/all-components` route
  embeds the React playground's gallery source rather than maintaining a copy.

## Verification state

`pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check:boundaries`,
`pnpm test:ssr`, `pnpm test:packed`, and the full 23-test Playwright suite are
CI gates. The browser suite includes representative light/dark/mobile visual
baselines plus live exhaustive React/Vue gallery smokes with Monaco readiness,
controlled edits, and console/page-error monitoring. The docs app compiles the React packages from source via Vite
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
  are compatibility facades over the per-application `@tweeq/dom` runtime
  injected by the Vue provider; their duplicated Pinia state and behavior have
  been deleted. React consumes the same runtime factories through React
  context, without sharing mutable instances across applications.
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

## Phase 4 family 5 (done 2026-07-13)

- CommandPalette history and selection transitions are core-owned. Commands
  now run through the shared actions store so lifecycle hooks are preserved,
  and Vue matches the cross-platform Ctrl/Cmd+P and arrow-key behavior.
- Menu now consumes the shared item model and safe-submenu-corridor geometry in
  both renderers. Its shared contract covers commands, short labels,
  separators, close propagation, controlled updates, and stable parts.
- Popover now has one native toggle lifecycle for light-dismiss and uses the
  same core anchor/shift/arrow geometry in both renderers. Its shared contract
  caught Vue's invalid `"close"` ToggleEvent state and protects controlled
  mounting, coordinate placement, native mode, and close event order.
- Tooltip parsing, empty-state detection, show/hide timers, anchor ownership,
  and the global snapshot now live entirely in DOM. Vue is a reactive adapter
  over that snapshot instead of a second state machine, and native close writes
  back through the shared controller.
- MultiSelect action availability and value transforms now live in DOM beside
  the existing selection store. DOM fixtures cover multi-selection, capture,
  speed-aware updates, confirm, and disposal; Vue also clears its popup element
  registration during unmount.

## Phase 4 family 6 (complete)

- InputCubicBezier uses core path/point helpers in both renderers. Its shared
  contract covers controlled paths, native disabled/invalid state, touch
  pointer drag, clamped updates, confirm lifecycle, and stable picker parts.
- Vue's mouse-only handle selection and missing confirm propagation were fixed;
  picker drag is now gated while disabled in both adapters.
- InputColor uses a shared controlled-value picker controller. Preset and
  EyeDropper changes now synchronize HSVA and confirm in both renderers;
  EyeDropper detection is SSR-safe and disabled state reaches picker channels,
  direct actions, and the outer text/number controls.
- GlslCanvas now has one DOM-owned regl queue/context in both renderers. Vue's
  duplicate context store was removed and its adapter redraws on resize and
  invalidates stale/unmounted image work.
- MonacoEditor shares diagnostic transforms and exposes equivalent controlled
  cursor, cursor-event, marker, theme, and key-isolation behavior. Vue's
  formerly commented implementation is restored through the wrapper mount
  hook, InputCode forwards errors, and async load completion is unmount-safe.
- Markdown now renders through one core-owned MarkdownIt plugin pipeline. Vue
  renders synchronously for SSR with a standard div root; its duplicated setup
  and abandoned commented Monaco highlighter were removed.
- InputColorPad's drag/multi-selection transition is core-owned, including
  correct additive behavior for zero-valued RGB channels. Vue no longer owns
  redundant regl or queue dependencies.
- Family gate: core/workspace tests, renderer builds, lint, boundaries,
  SSR/CJS rendering/imports, packed React/Vue consumers, and all 21 Playwright
  tests pass.

## Phase 4 family 7 (complete)

- Tabs uses core enabled-tab resolution and a shared renderer contract. Custom
  persistence keys, native disabled buttons, initial/change/re-click events,
  ARIA orientation, stable parts, and reactive id re-registration are aligned.
- PaneSplit uses one core resize controller and the shared pointer lifecycle.
  Its renderer contract covers proportional and fixed-second movement, public
  minimum clamping, persistence-facing styles, and stable pane/divider parts.
- PaneFloating uses the core anchor/minimize transition and shared pointer
  lifecycle. The contract covers edge minimization; Vue now composes window
  clamps and excludes the titlebar from available height like React.
- PaneExpandable has a shared controlled/uncontrolled contract with native
  expanded state. Vue no longer mutates rejected controlled updates.
- Modal adapters settle replaced/unmounted prompt sessions, preserve declared
  tab ids, and use feature-safe native popover calls. The general Vue Popover
  received the same partial/no-API fallback after the pane contract exposed it.
- TitleBar menu triggers now share keyboard/accessibility and descendant
  focus/OS drag-region behavior.
- Vue App mirrors the React appId/theme/provider/embedded surface and prevents
  Viewport from overwriting provider initialization. PaneZUI consumes one DOM
  gesture graph and core visible-rect/dot geometry, including initial transform.
- ParameterGroup has a shared persistent expand/collapse contract; Vue now
  renders its public icon and uses a native button with expanded state.
- TitleBar action-menu decoration and modal multiline keyboard ownership are
  DOM-owned helpers rather than copied renderer transitions.
- Family gate: all workspace tests/builds, lint, boundaries, SSR/CJS imports
  and renders, packed React/Vue consumers, and all 21 Playwright tests pass.

## Phase 5 documentation and compatibility (complete)

- The documentation home switcher now presents current, renderer-specific
  `@tweeq/react` and `@tweeq/vue` installation and component APIs; it no longer
  directs Vue users through the removed Pinia/upstream-package setup.
- Separate migration guides cover existing upstream Vue consumers and the
  pre-monorepo React fork.
- Vue's legacy `useTweeq().Component` facade now warns once and has an explicit
  `@tweeq/vue` 2.0.0 removal version. New Vue examples use named imports.
- `docs/api-exports.md` is generated from package export maps and built
  declaration entries. CI rebuilds packages and rejects a stale API inventory.
- UIST and user-study pages select between the React documentation examples
  and an independently built Vue research app. Pages deploys both renderer
  artifacts without mixing their providers or component APIs in one runtime.
- The Vue playground now has strict template typechecking and full lint
  coverage; enabling that gate exposed and fixed InputComplex's invalid
  descriptor requirement for an internally supplied `modelValue`.
- Renderer migration snippets point to their complete packed React/Vue
  consumers. CI typechecks and builds both outside the workspace, while
  `docs:check` rejects stale API inventories and broken Markdown links.
- Phase gate: both renderer/docs production builds, strict Vue template
  checking, Vue renderer tests, workspace lint, API/link validation, packed
  consumers, and all 21 Playwright tests pass.

## Phase 6 prerelease and cleanup (in progress)

- pnpm 11's strict dependency-build policy now explicitly approves the reviewed
  `@parcel/watcher@2.5.6` source-build fallback. Clean push run 29272057405
  completed every CI gate after earlier incremental local installs had masked
  the missing approval. CI, Pages, and release workflows also use Node
  24-native action runtimes instead of relying on GitHub's Node 20
  compatibility override: v6 for checkout, setup-node, and upload-artifact,
  plus the exact `pnpm/action-setup@v4.4.0` release that directly installs the
  repository-pinned pnpm version.
- A generated release baseline records emitted raw/gzip artifact sizes, core
  transition throughput, renderer contract counts, browser coverage, and the
  packed downstream-consumer evidence. Normal CI uploads this as a
  non-blocking per-commit artifact; the release workflow regenerates it as a
  blocking release-runner artifact.
- Docs now use Sass's modern compiler API; the legacy API warning is closed.
- CI enforces that all public packages remain private before npm ownership is
  approved. The manual `npm-release` environment additionally requires an
  explicit channel-specific confirmation, approved-scope secret, non-private
  channel-appropriate fixed versions, public npm publish configuration, all
  reproducibility gates, provenance, browser parity, an uploaded release-runner
  baseline, exact uploaded tarballs, and registry-installed React/Vue
  downstream builds. The same trusted-publisher workflow serves `next` and
  `latest`; a stable release additionally requires a protected approval value
  equal to its version after a feedback cycle, and the verified commit is
  tagged only after both registry consumers pass. Public manifests carry npm's
  required matching repository metadata; OIDC publishing supersedes the
  protected first-publication token after trusted publishers are configured.
- No local publish command is part of the workflow; publication is GitHub
  Actions-only, as required by repository policy.
- Active Markdown setup snippets now reject the removed upstream/Pinia install
  path. All four workspace consumers import the canonical renderer stylesheet
  and render an `App`/`Viewport` style root; the clean packed examples exercise
  provider-owned React and Vue runtimes rather than a provider-less facade.
- DOM stores now come only from explicit factories. Each React/Vue provider or
  standalone viewport owns an isolated runtime, theme binding, and listener
  disposal; provider-less legacy calls resolve a lazy compatibility runtime.
  The boundary gate rejects renderer imports of those compatibility stores,
  and DOM tests cover concurrent isolation plus bind/dispose behavior.
- The initial baseline exposed MF-044: the canonical styles artifact was only
  a placeholder while renderer CSS was generated separately. The completed
  convergence covers these primitive/control families:
  buttons, switches, indicators, ColorIcon/GlslCanvas, InputAngle, InputGroup,
  ParameterGrid, Markdown, InputPosition, BindIcon, TweakOverlay,
  InputNumberScales, Tab, ParameterHeading, InputCode, MonacoEditor, Icon,
  SvgIcon, Ruler, InputColorPicker, InputColorPresets, and
  InputColorChannelValues, InputColorChannelPad, InputColorChannelSlider, and
  InputColor, PaneZUI, PaneExpandable, Parameter, InputComplex, Tooltip, and
  TooltipRoot, PaneModal, PaneModalTabs, PaneModalComplex, Timeline,
  InputCubicBezier, InputCubicBezierPicker, App, Viewport, Popover, and
  InputSize, TitleBar, ParameterGroup, Balloon, Menu, PaneSplit, Tabs, and
  InputTextBase, InputDropdown, InputTranslate, InputRadio,
  InputSwitchOverlay, InputDrum, InputRotary, PaneFloating, InputColorPad,
  MultiSelectPopup, CommandPalette, InputTime, and InputNumber. Both renderers
  emit the same stable component/part/state attributes and all 139 local
  component/reset copies are deleted. Renderer builds copy the compressed
  `@tweeq/styles/style.css` artifact. The artifact retains the common Monaco
  base CSS before Tweeq's editor overrides; baseline and packed gates require
  the three public CSS aliases to remain byte-identical and the packed gate
  rejects an artifact that drops Monaco's required rules.

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
  relocated Vue package instead of the deleted root `src/` entry. Phase 6
  subsequently removed that unscoped alias entirely; retained authoring
  components now name `@tweeq/vue`, while current docs still reuse their logo,
  research assets, and user SCSS.
- Core now compiles without the DOM library; its remaining `DOMRectReadOnly`
  adapter moved to `@tweeq/dom`, enforcing ADR 0002 at the type-system level.
