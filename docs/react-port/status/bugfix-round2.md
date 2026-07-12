# Bugfix round 2

## InputDropdown

- **Spec:** The legacy list reports crop state from its scroll position (`src/InputDropdown/InputDropdown.vue:215-225`) and renders 0.7-row fade controls as siblings of the scrolling list, inset 2px horizontally and 1px vertically (`:473-490`, `:596-617`).
- **Root cause:** The React DOM matched the sibling structure, but `.selectWrapper` did not establish a formatting context. The list's 1px margins (`src/react/components/InputDropdown/InputDropdown.module.styl:57`) could collapse through the wrapper, so absolutely positioned arrows used a different box edge than the list.
- **Fix:** `.selectWrapper` now uses `display: flow-root` (`InputDropdown.module.styl:52-54`), containing the list margins. The existing legacy-matched 2px insets, 1px edge offsets, 0.7-row height, radii, gradients, and scroll-state conditions now resolve against the list's outer box.
- **Verification:** Source geometry/structure compared line-for-line; TypeScript and unit gates pass. Browser screenshots could not be captured because the Playwright Vite server could not bind/start in this sandbox.

## InputDrum

- **Spec:** The docs call it a horizontal slot-machine picker and require drag-to-spin, click-to-jump, wheel stepping, and arrow keys (`docs/components.md:137-176`). Legacy binds `useDrag` to the root (`src/InputDrum/InputDrum.vue:88-130`) while its viewport is only a visual clipping/fade layer (`:278-290`).
- **Root cause:** The React full-inset masked viewport remained a hit-test surface above the root (`src/react/components/InputDrum/InputDrum.module.styl:27-33`), causing the reported center dead zone even though gesture math was bound to the root.
- **Fix:** The viewport and fixed center mark are now pointer-transparent (`InputDrum.module.styl:27-33`, `:77-84`), so every point lands on the root gesture surface. Existing root-relative click math remains intact.
- **Verification:** Extended `e2e/temporal.spec.ts` with a visible-neighbour center-region click and a center-origin 50px drag. TypeScript, ESLint for the changed spec, and all 84 Vitest tests pass; Playwright server startup is blocked in this sandbox.

## InputSize

- **Spec:** Clicking the centered chain icon toggles aspect constraint (`docs/components.md:290-309`); legacy absolutely centers a bare icon with `left: 50%` and `translateX(-50%)` (`src/InputSize/InputSize.vue:70-81`).
- **Root cause:** React correctly used a semantic button (`src/react/components/InputSize/InputSize.tsx:55-66`) but did not reset native button padding/border/background, so the icon's painted center differed from the absolutely centered button box.
- **Fix:** Reset native button box styling and enforce border-box sizing (`InputSize.module.styl:13-16`).
- **Verification:** Static style comparison plus clean TypeScript/Vitest gates.

## InputTime

- **Spec:** The docs require drag adjustment with selectable hour/minute/second/frame scales (`docs/components.md:359-389`). Legacy mounts a `TweakOverlay` only while tweaking and draws meter/frame/second/minute/hour paths (`src/InputTime/InputTime.vue:354-380`), with the InputTextBase root explicitly allowing overflow (`:386-388`).
- **Root cause:** The React InputTime class's `overflow: visible` competed at equal specificity with InputTextBase's `overflow: hidden`; CSS-module load order allowed the base rule to win, hiding the wheel fallback/in-place render and making it appear absent.
- **Fix:** The component-specific overflow override is now authoritative (`src/react/components/InputTime/InputTime.module.styl:3-5`). Overlay mount and wheel SVG logic were already present.
- **Verification:** Extended `e2e/temporal.spec.ts` to hold a center drag and assert the overlay SVG becomes visible. Static/unit gates pass; Playwright server startup is blocked here.

## PaneModalComplex

- **Spec:** Legacy keeps the generated form in a shrinking vertical scroll container, offsets only the right scrollbar edge, preserves pane-padding clearance, and applies the scroll fade (`src/PaneModalComplex/PaneModalComplex.vue:104-113`).
- **Root cause:** The React scrollport ended exactly on the final row's one-pixel border (`src/react/components/PaneModalComplex/PaneModalComplex.module.styl:9-16`), so the scroll edge/mask clipped that border.
- **Fix:** Added one pixel of bottom scrollport clearance while retaining the legacy right negative margin, right padding, and fade mask (`PaneModalComplex.module.styl:13-16`).
- **Verification:** TypeScript and all 84 Vitest tests pass; modal browser inspection is deferred because Playwright could not start its server in this sandbox.

## Gates

- `npx tsc -p tsconfig.json --noEmit`: pass.
- `npx eslint e2e/temporal.spec.ts`: pass. Stylus files are not covered by the repository ESLint configuration (warnings only when explicitly supplied).
- `npx vitest run`: pass, 22 files / 84 tests.
- `npm run e2e -- --grep "temporal and rotary"`: unavailable; configured web server exited during startup (sandbox port-bind limitation).
- `git diff --check`: pass.
