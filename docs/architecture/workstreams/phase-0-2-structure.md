# Workstream status: Phases 0–2 (baseline, workspace, relocation)

Status: **complete** (2026-07-13)  
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

## Notes for Phase 3 workers

- Temporary compatibility items are tracked in the parity matrix's deletion
  checklist — extend it, don't add TODO comments.
- The `packages/react/src/core/` barrel is the main Stage V2 seam: pick a
  leaf family (util/validator/timecode/theme are already shared; dropdown,
  menu, panes are shared logic with per-renderer adapters) and replace the
  Vue-side duplicate (`packages/vue/src/util.ts`, `validator.ts`, `theme/`)
  with `@tweeq/core` imports behind unchanged public exports.
- `@tweeq/vue` still bootstraps through Pinia (`useAppConfigStore` & co).
  Stage V3 replaces each store with the shared `@tweeq/dom` factory behind a
  compatibility `useTweeq()`; do it one store at a time with contract tests.
- `@tweeq/test-contracts` has the harness interface but no suites yet; the
  first suite should target InputNumber (richest fixtures in core).
- Do not publish any package until ADR 0001's ownership question is settled.
