# React docs site parity

## Pages

- **Home:** Reproduces the VuePress home hero and copied logo, ordered action links, all five frontmatter feature cards, original introduction/author copy, and the complete installation and Vue usage examples. The frontmatter defines no footer text, so none was invented. The remote license badge is omitted to avoid making the demo depend on a third-party image service.
- **Features:** Ports the markdown prose and key list verbatim, including the legacy `components_list.webp` asset. The descriptions refer to the live controls available elsewhere in the demo.
- **Components:** Provides the documented Input Components in the original order, embeds their current auto-discovered React demo sections when available, ports the natural-language gesture descriptions, and adapts the common Vue props/events table to React names (`value`, `onChange`, etc.). The legacy `DemoComponent.vue` option editor is not recreated because section demos already exercise the current React props and behavior.
- **Colors:** Restores all introductory markdown text and retains the live React palette generator, appearance/accent/gray/background controls, scales, semantic colors, and palette.
- **Example:** Keeps the screenshot-faithful live `ExampleContainer` demos and their original headings/values/schemes. The extra non-source introductory sentence was removed.
- **All Components:** Relocates the existing gallery without changing its `import.meta.glob('./sections/*Section.tsx')`, filename ordering, section components, or their test IDs. Empty/unknown hashes default here so existing `/` e2e consumers remain compatible.

## Navigation and behavior

The hash router exposes visible tabs in the required Home, Features, Components, Colors, Example, All Components order. The logo/brand goes Home; the GitHub link opens the repository in a new tab. The theme-store-backed toggle switches light/dark mode and therefore the root `data-color-mode` and generated `--tq-*` variables.

Each page derives a left sidebar from its stable `h2[id]` headings. Sidebar clicks update the deep-link hash and smooth-scroll, while an `IntersectionObserver` highlights the visible section. The sidebar is hidden on narrow screens. Demo chrome now explicitly gives anchors, buttons, nav items, and button-like controls a pointer cursor, with nav/prose hover feedback.

## Verification

- `npx tsc -p tsconfig.json --noEmit` — passed.
- `npx eslint demo e2e/docs-pages.spec.ts` — passed.
- `npx vitest run` — 22 files / 84 tests passed.
- `npm run e2e -- --grep 'documentation|Many Sliders|Colors page|default route'` — attempted through the required npm script, but Playwright's configured web server could not bind/start in this sandbox (exit code 1 before tests ran). The orchestrator should run the e2e suite in its port-enabled environment.
