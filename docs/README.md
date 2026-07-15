# Tweeq documentation map

The Markdown pages in this directory are the shared documentation source.
VuePress renders them under `/vue/`; the React documentation shell compiles
the same files through MDX and exposes matching routes at the site root. A
small build adapter maps the Vue-style demo bindings to React props. Renderer switches
preserve the current page and anchor, so `components.html` corresponds to
`vue/components.html`.

The renderer playgrounds remain independent applications for exhaustive
component coverage and visual regression tests. The Vue documentation reuses
the Vue gallery at `vue/all-components.html` without turning the playground
into the documentation shell.

## Using Tweeq

- [`../packages/react/README.md`](../packages/react/README.md) — React setup,
  runtime ownership, and browser support
- [`../packages/vue/README.md`](../packages/vue/README.md) — Vue setup, legacy
  initialization, and browser support
- [`migration.md`](migration.md) — migration from the original Vue package

The runnable package-consumer examples live in `examples/react-vite` and
`examples/vue-vite`.

## Architecture and maintenance

- [`architecture/README.md`](architecture/README.md) — package layers, design
  rules, and repository layout
- [`architecture/0001-package-naming-and-publishing.md`](architecture/0001-package-naming-and-publishing.md)
  — package names and release policy
- [`architecture/0002-browser-support-and-ssr-imports.md`](architecture/0002-browser-support-and-ssr-imports.md)
  — browser and SSR support
- [`architecture/parity-matrix.md`](architecture/parity-matrix.md) — current
  cross-renderer behavior and intentional differences
- [`architecture/release-baseline.md`](architecture/release-baseline.md) —
  generated size, performance, and test evidence

## Documentation checks

Run `pnpm docs:check` to verify that local Markdown links resolve and migration
snippets match the packed consumer examples. Run `pnpm test:packed` to verify
the published export maps, declarations, and package contents against real
React and Vue consumers.
