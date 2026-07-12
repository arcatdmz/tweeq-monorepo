# Legacy docs content → React demo

## Ported pages

- **Home** (empty hash or `#/home`): landing copy, core feature summary, and a React-first usage sample with the legacy Vue sample available from a framework switcher.
- **Components** (`#/components`): the prose component reference; the auto-discovered gallery remains available at `#/all-components`.
- **Examples** (`#/example`): all five scheme-driven forms from `docs/example.md` — Many Sliders, Color Palettes, Three Angle Inputs, Bunch of Switches, and List of File Names.
- **Colors** (`#/colors`): editable appearance/accent/gray/background controls, two 12-step scales, semantic colors, and the seven-hue palette from `ColorPaletteDemo.vue`.
- **Features** (`#/features`): the four legacy feature sections with their interaction key guidance.

## Mapping decisions

- `demo/pages/ExampleContainer.tsx` owns controlled value state, renders `InputComplex` (which itself uses `ParameterGrid`), and exposes the current value as formatted live JSON in a second `ParameterGrid`.
- VuePress navigation became a dependency-free hash router. Unknown/empty hashes resolve to Home.
- Legacy Material Design Icon names in dash form (`mdi-palette`, `mdi-equalizer`, `mdi-toggle-switch`) were normalized to Iconify form (`mdi:palette`, etc.). The forms render these through the React `Icon` path.
- The color demo calls the same pure core theme functions as the application and keeps preview state local, matching the legacy helper without reskinning the global demo.

## Research routes

Research/publication content is available at `#/uist2025`, `#/user-study`,
`#/user-study-components`, and `#/presentation`. The routes preserve the
interactive parameter examples using the React controls and fullscreen demo
containers.

## Verification

Automated coverage is in `e2e/docs-pages.spec.ts`: routing, editing a Many Sliders field with live JSON update, and 24 generated color scale swatches.

- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx eslint` for the touched TS/TSX files: passed.
- `npx vitest run`: passed (22 files, 84 tests).
- `npm run e2e`: Playwright could not start its configured Vite server because this execution sandbox rejected binding `127.0.0.1:5174` with `listen EPERM`. No browser tests ran; rerun this command in a host environment that permits localhost listeners.
