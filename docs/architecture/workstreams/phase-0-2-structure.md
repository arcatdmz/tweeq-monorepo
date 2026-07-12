# Workstream status: Phases 0–2 (baseline, workspace, relocation) + Phase 3 leaf tier

Status: **Phases 0–2 complete; Phase 3 leaf-utility tier complete** (2026-07-13)  
Owner: integration worker  
Plan: [../monorepo-migration.md](../monorepo-migration.md)

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

`pnpm build`, `pnpm test` (60 core + 26 dom), `pnpm lint`,
`pnpm check:boundaries`, `pnpm test:packed`, and the full 19-test Playwright
suite are all green. The docs app compiles the React packages from source
via Vite aliases; packed-artifact coverage is the examples' job.

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

## Notes for Phase 3/4 workers

- Temporary compatibility items are tracked in the parity matrix's deletion
  checklist — extend it, don't add TODO comments.
- Stage V3 now shares the InputSwitch transitions and InputRotary clamp logic.
  The five app-level Vue stores (actions, appConfig, modal, multiSelect, theme)
  are compatibility facades over the same `@tweeq/dom` instances React uses;
  their duplicated Pinia state and behavior have been deleted.
- The Vue `useDrag` composable is now a ref/lifecycle adapter over the shared
  `@tweeq/dom` drag controller. Component-local Pinia contexts (`InputTime`
  and regl) are tracked separately for V4 cleanup rather than app-store
  migration.
- `@tweeq/test-contracts` has the harness interface but no suites yet; the
  first suite should target InputNumber (richest fixtures in core).
- Do not publish any package until ADR 0001's ownership question is settled.
