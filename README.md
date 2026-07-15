<div align="center">

<img src="./docs/.vuepress/public/logo.svg" width="200" />
<h1>Tweeq</h1>

<a href="https://arcatdmz.github.io/tweeq/">React and Vue Documentation</a> ⌇ <a href="https://arcatdmz.github.io/tweeq/vue/">Vue Demo</a> ⌇ <a href="https://github.com/baku89/tweeq">Original Project</a> ⌇ <a href="https://github.com/sponsors/baku89">Sponsor Baku</a>

</div>

> [!NOTE]
> This repository is a fork of [baku89/tweeq](https://github.com/baku89/tweeq), the original Vue implementation created by [Baku Hashimoto](https://baku89.com). The component design, interaction model, and research originate from Baku's work. This fork maintains React and Vue renderers; see the [architecture overview](docs/architecture/README.md) for their shared package structure.

> [!NOTE]
> For the React live demo of [the UIST paper](https://dl.acm.org/doi/10.1145/3746059.3747723), see [the UIST 2025 page](https://arcatdmz.github.io/tweeq/uist2025.html). The [original Vue demo](https://baku89.github.io/tweeq/uist2025.html) remains available as the source reference.

Tweeq is a collection of maintained [React](https://react.dev) and [Vue 3](https://vuejs.org) components for design tools. The components range from fundamental UIs such as numeric sliders and color pickers to advanced, niche controls such as a cubic-bezier editor. Both renderers share the precise micro-interactions used by creative professionals.

## Documentation

- [Live React and Vue documentation](https://arcatdmz.github.io/tweeq/)
- [Repository documentation map](docs/README.md)
- [Architecture overview](docs/architecture/README.md)
- [React package guide](packages/react/README.md) and [Vue package guide](packages/vue/README.md)
- [Migration guide for original Vue users](docs/migration.md)

## Project Setup

This is a [pnpm workspace](https://pnpm.io/workspaces). Package responsibilities,
dependency rules, and the repository layout are documented in the
[architecture overview](docs/architecture/README.md).

```sh
pnpm install
pnpm dev          # React docs/demo app (apps/docs)
pnpm --filter @tweeq/playground-vue dev   # Vue playground
pnpm build        # build every package and app
pnpm test         # package unit tests
pnpm lint         # lint packages, docs app, and browser tests
pnpm check:boundaries # enforce package layers and an acyclic workspace graph
pnpm test:ssr     # import every JavaScript package entry in plain Node
pnpm e2e          # Playwright suite against the docs app
pnpm test:packed  # pack + install + build the example consumers
```

## Renderer usage

### React

Tweeq requires React 18 or newer. Import the generated stylesheet once and wrap the application in `TweeqProvider`; inputs use controlled `value` / `onChange` props. (The `@tweeq/*` names are workspace-internal until publishing is settled — see [ADR 0001](docs/architecture/0001-package-naming-and-publishing.md).)

**All base styles (font, CSS reset, selection/scrollbar chrome) are scoped to `<Viewport>`'s subtree** — same as the Vue version, where they were tied to `.TqViewport`. `TweeqProvider` alone only provides stores and overlay roots; components rendered outside a `<Viewport>` (or `<App>`, which includes one) will look unstyled.

```tsx
import {useState} from 'react'
import {InputNumber, TweeqProvider, Viewport} from '@tweeq/react'
import '@tweeq/react/style.css'

export function Example() {
  const [value, setValue] = useState(24)

  return (
    <TweeqProvider appId="example">
      <Viewport appId="example">
        <InputNumber value={value} onChange={setValue} min={0} max={100} />
      </Viewport>
    </TweeqProvider>
  )
}
```

### Vue

Tweeq requires Vue 3. Import the generated stylesheet once and use `App` for
the standard application shell. Vue inputs use `v-model` for controlled
values.

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {App, InputNumber} from '@tweeq/vue'
import '@tweeq/vue/style.css'

const value = ref(24)
</script>

<template>
  <App app-id="example">
    <InputNumber v-model="value" :min="0" :max="100" />
  </App>
</template>
```

## Project Background

Tweeq has been developed in parallel with Baku's animation projects, as part of the design tools used in those projects ([Koma](https://github.com/baku89/koma) and [Unim](https://github.com/baku89/unim)). Many of its components follow the following design principles:

- support diverse input modalities to match users' nuanced control strategies,
- prioritize high-speed and accurate interaction for skilled users, and
- minimize visual footprint to preserve the creative workspace.

The design principles were derived from a study that sampled parameter-tuning GUI widgets from popular production software and analyzed their interaction design.

The research behind Tweeq was conducted by Baku, partly in his capacity as a collaborative researcher at AIST, in collaboration with [Jun Kato](https://junkato.jp), a chief senior researcher at AIST. For more details, see [the project page](https://junkato.jp/tweeq) and the published open-access paper:

> Baku Hashimoto and Jun Kato. 2025. Tweeq: Parameter-Tuning GUI Widgets by/for Creative Professionals. In <i>The 38th Annual ACM Symposium on User Interface Software and Technology (UIST '25), September 28–October 01, 2025, Busan, Republic of Korea</i>. ACM, New York, NY, USA, 16 pages. https://doi.org/10.1145/3746059.3747723

```
@inproceedings{uist2025-tweeq,
  title = {Tweeq: Parameter-Tuning GUI Widgets by/for Creative Professionals},
  author = {Hashimoto, Baku and Kato, Jun},
  year = {2025},
  booktitle = {Proceedings of the 38th Annual ACM Symposium on User Interface Software and Technology},
  location = {Busan, Republic of Korea},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  series = {UIST '25},
  doi = {10.1145/3746059.3747723},
  isbn = {9798400720376},
  url = {https://doi.org/10.1145/3746059.3747723},
  numpages = {16},
  keywords = {creativity support, user interface, creative software, numeric slider, color picker}
}
```
