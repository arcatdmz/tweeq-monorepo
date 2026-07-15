---
home: true
heroImage: /logo.svg
heroHeight: 160
actionText: Get Started →
actions:
  - text: Components
    link: /components
  - text: Features
    link: /features
    type: secondary
  - text: Example
    link: /example
    type: secondary
  - text: UIST 2025 Paper
    link: /uist2025
    type: secondary
features:
  - title: Specialized Inputs for Creators
    details: Tweeq offers a suite of specialized input components tailored for professional creative applications.
  - title: Drag-to-tweak Interaction
    details: Components support various types of micro-interactions, including direct drag gestures for precise and quick parameter adjustments.
  - title: Simultaneous Editing
    details: Select and edit multiple parameters parametrically at once.
  - title: Expression Support
    details: Control parameters dynamically through JavaScript expressions.
  - title: Peer-Reviewed Research
    details: Accepted at UIST 2025, demonstrating the academic rigor and practical value of Tweeq's design principles.
---

<div class="badges">
	<p>
		<a href="https://spdx.org/licenses/MIT.html">
			<img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT license">
		</a>
	</p>
</div>

This repository maintains [React](https://react.dev) and [Vue 3](https://vuejs.org)
renderers over the shared behavior of [baku89/tweeq](https://github.com/baku89/tweeq).
Both use the same parameter semantics, interaction controllers, and visual system.

It is continuously developed by the visual artist [Baku Hashimoto](https://baku89.com).

## How to Use

### React

```sh
npm install @tweeq/react react react-dom
```

`@tweeq/core` and `@tweeq/dom` are transitive renderer dependencies. Install
them explicitly only when application code imports their APIs directly.

#### main.tsx

```tsx
import {createRoot} from 'react-dom/client'
import '@tweeq/react/style.css'
import {MyApp} from './App'

createRoot(document.getElementById('root')!).render(<MyApp />)
```

#### App.tsx

```tsx
import {useState} from 'react'
import {App, InputNumber, Parameter, ParameterGrid, TitleBar} from '@tweeq/react'

export function MyApp() {
  const [opacity, setOpacity] = useState(1)

  return (
    <App
      appId="com.yourid.yourapp"
      colorMode="dark"
      accentColor="#ff0000"
      title={<TitleBar name="My App" icon="favicon.svg" />}
    >
      <ParameterGrid>
        <Parameter label="Opacity">
          <InputNumber value={opacity} min={0} max={1} onChange={setOpacity} />
        </Parameter>
      </ParameterGrid>
    </App>
  )
}
```

### Vue

```sh
npm install @tweeq/vue vue
```

#### main.ts

```ts
import {createApp} from 'vue'
import '@tweeq/vue/style.css'
import Root from './App.vue'

createApp(Root).mount('#app')
```

#### App.vue

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {App, InputNumber, Parameter, ParameterGrid, TitleBar} from '@tweeq/vue'

const opacity = ref(1)
</script>

<template>
  <App app-id="com.yourid.yourapp" color-mode="dark" accent-color="#ff0000">
    <template #title>
      <TitleBar name="My App" icon="favicon.svg" />
    </template>
    <ParameterGrid>
      <Parameter label="Opacity">
        <InputNumber v-model="opacity" :min="0" :max="1" />
      </Parameter>
    </ParameterGrid>
  </App>
</template>
```
