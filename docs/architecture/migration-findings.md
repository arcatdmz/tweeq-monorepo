# Monorepo migration findings log

This log records concrete defects discovered while executing the migration,
including defects fixed in the same workstream. A finding must not disappear
only into a code diff: record its user or release impact, disposition, and the
evidence that closes it. Items intentionally left open state why and name the
phase that owns the follow-up.

## Fixed findings

| ID | Area | Observed defect and impact | Resolution and evidence |
| --- | --- | --- | --- |
| MF-001 | package ESM | Core and DOM emitted extensionless relative ESM imports. Bundlers hid the issue, but plain Node could not import the published entry points. | Explicit `.js` specifiers and an SSR/plain-Node gate were added in `2c013bf`. |
| MF-002 | Vue SSR | Importing Vue eagerly initialized browser-only regl and Monaco state, so Node/SSR imports failed. | Browser state is lazy and `pnpm test:ssr` imports every public entry; fixed in `2c013bf`. |
| MF-003 | package artifacts | Vue's CommonJS entry, packed file ownership, stale runtime dependencies, and leaked test/source artifacts did not match the manifest contract. | Corrected and protected by clean packed consumers in `9599c9a` and `c2950f3`. |
| MF-004 | release gates | The packed test rewrote live manifests, CI omitted important parity gates, and Pages deployment could race CI on the same push. | Packed tests now operate on isolated artifacts; CI/deploy ordering and gates were repaired in `35b6201` and `c2950f3`. |
| MF-005 | InputTranslate | Vue duplicated overlay geometry and accepted drag while disabled; its button also lacked native type, disabled, and invalid semantics. | Core geometry plus the cross-renderer bounded-drag contract landed in `647fa92`. |
| MF-006 | InputTime | Vue used a renderer-local eval parser, did not clamp typed expression results, allowed disabled drag, omitted invalid state, emitted `blur` on mount, and did not confirm consistently on real blur. | Core expression/quantization and the shared InputTime contract fixed these in `983644f` and `bbeb01c`. |
| MF-007 | InputDrum | A wheel event spanning multiple thresholds repeatedly selected the first next index before a controlled parent could re-render, so it advanced only one step. Layout, drag, wheel, and type-ahead transitions were also duplicated. | Core transitions consume all wheel steps atomically; core fixtures and both renderer contracts landed in `001b2bf`. |
| MF-008 | InputRotary | Vue retained copied snap/angle logic, accepted disabled drag, dropped multi-select updates whose value was `0`, failed to resynchronize local state after external values, and reused one SVG marker ID across instances. | Core drag transition, native semantics, zero-safe updates, state synchronization, unique IDs, and a shared contract landed in `634a31a`. |
| MF-009 | Timeline | Vue used a separate bndr wheel controller, ignored vertical wheel input for ordinary pan, and declared but did not render its scrollbar-right slot. | Both adapters now use native wheel events and core range transitions; the shared contract covers zoom and both slots. |
| MF-010 | Ruler | Scale and pointer geometry were copied in both renderers; zero-length ranges or zero-width viewports could produce non-finite CSS/value calculations. | Core Ruler geometry returns finite values and has zero-size fixtures; both renderers use it and share a rendering contract. |
| MF-013 | CommandPalette | Both renderers invoked an action's raw `perform` callback, bypassing the shared actions store and therefore every registered `onBeforePerform` hook. Vue also handled only the Command-key shortcut and allowed arrow navigation to retain native caret behavior. | Commands now execute through `actionsStore.perform`; history/navigation transitions are core-owned, Vue uses the same Ctrl/Cmd+P native shortcut, and handled arrows prevent their default action. |
| MF-014 | renderer contract isolation | The React InputSwitch contract rendered real Iconify components. Their deferred loader timer could update React after jsdom teardown, producing a nondeterministic `window is not defined` unhandled error even though all assertions passed. | The contract now uses the same synchronous Iconify boundary mock as other renderer contracts; repeated full renderer runs verify clean teardown. |
| MF-015 | Popover | Both adapters listened for Escape and emitted close/update callbacks even though an `auto` native popover already dismisses itself and emits `toggle`, allowing one Escape press to notify controllers twice. Vue also compared ToggleEvent's closed state with the invalid string `"close"` instead of `"closed"`, so native dismissals omitted its `close` event, and retained a full copy of the core geometry. | Escape dismissal now has one authority—the native popover `toggle` lifecycle; Vue recognizes `"closed"` and consumes the core geometry/style functions used by React. |
| MF-016 | Tooltip | Vue duplicated the DOM tooltip timers, anchor owner, and snapshot. TooltipRoot handled native close by mutating only the Vue-local `open` flag, leaving the shared snapshot open so a later store notification could restore stale visibility. | DOM now owns value parsing, emptiness, timers, anchor ownership, and the snapshot. Vue is a reactive snapshot adapter and routes native close through `setTooltipOpen`; DOM fixtures protect delayed show, immediate handoff, and owner-only hide. |
| MF-017 | MultiSelectPopup | Vue registered its popup element with the shared store on mount but never cleared it on unmount, retaining a stale DOM reference in outside-click selection logic. Action availability and value transforms were also copied between renderers. | Vue clears the popup registration on unmount; DOM owns action generation and has selection/capture/update/confirm/dispose fixtures used by both adapters. |

## Open findings

| ID | Area | Current evidence and impact | Disposition |
| --- | --- | --- | --- |
| MF-011 | bundle size | Vite reports chunks over 500 kB, primarily from editor/language assets, in renderer, docs, and packed-consumer builds. Builds remain correct, but initial-load and caching costs have not been baselined. | Keep open for Phase 6 bundle-size and runtime-performance baselines; decide code splitting from measured consumers rather than changing package semantics during controller migration. |
| MF-012 | Sass tooling | Docs builds report Dart Sass's legacy JS API deprecation. It does not fail current builds, but a future Sass major will remove that API. | Keep open for the build-tool cleanup portion of Phase 6; upgrade the owning Vite/Sass integration and re-run docs plus visual gates. |

## Recording rule

When a new clear defect is found, add it here in the same change that fixes it,
or add it to **Open findings** before continuing if it is intentionally deferred.
Closing an open item requires concrete verification evidence and should retain
the original ID for history.
