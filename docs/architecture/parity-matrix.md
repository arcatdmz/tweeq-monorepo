# Renderer parity

React and Vue share domain behavior, browser controllers, stores, theme
generation, and component styles. A change to shared behavior is complete only
when the renderer-neutral contract passes against both implementations.

## Intentional differences

| Area | React | Vue |
| --- | --- | --- |
| Controlled values | `value` / `onChange` | `modelValue` / `update:modelValue` (`v-model`) |
| Composition | props, render callbacks, hooks | props, slots, composables |
| Runtime injection | React context | Vue provide/inject |
| Framework wrappers | React Monaco and Iconify packages | Vue Monaco and Iconify packages |

`App` and `TweeqProvider` own isolated runtimes in both renderers. The legacy
provider-less initialization APIs remain compatibility paths and should not be
mixed with a provider-owned runtime.

## Shared guarantees

- All public component families are represented in both exhaustive
  playgrounds.
- Renderer-neutral input, pane, menu, popover, timeline, and accessibility
  contracts run against both packages.
- Both renderer stylesheet exports are byte-identical aliases of
  `@tweeq/styles/style.css`.
- Both package entries are safe to import in plain Node; browser integrations
  activate lazily.
- Packed React and Vue examples typecheck and build without workspace source
  aliases.

Anything outside the intentional differences above should be treated as a
parity regression. Run `pnpm test`, `pnpm check:boundaries`, and the relevant
Playwright specs when changing shared behavior.
