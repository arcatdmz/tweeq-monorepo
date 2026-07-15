# Migrating from the original Vue package

This guide moves an existing application from `baku89/tweeq` to the maintained
Vue 3 renderer. Components continue to use `v-model` and named slots, while
`App` or `TweeqProvider` now owns an isolated application runtime.

The complete [`examples/vue-vite`](../examples/vue-vite) consumer is the
executable version of this setup.

> The `@tweeq/*` package names remain workspace names until npm ownership is
> settled. See [ADR 0001](architecture/0001-package-naming-and-publishing.md)
> before installing them from a public registry.

## Replace the package and stylesheet

Remove the original package and Pinia if no other application code uses it,
then install the Vue renderer:

```sh
pnpm remove baku89/tweeq
pnpm add @tweeq/vue vue
```

Import the renderer stylesheet once at the application entry:

```ts
import '@tweeq/vue/style.css'
```

Tweeq no longer requires a Pinia installation.

## Let the application own the runtime

Pass the old initialization values to `App`, which includes the required
viewport style scope:

```vue
<script setup lang="ts">
import {App} from '@tweeq/vue'
</script>

<template>
  <App
    app-id="com.example.app"
    color-mode="dark"
    accent-color="#ff0000"
  >
    <!-- application controls -->
  </App>
</template>
```

For a custom shell, use `TweeqProvider` with a nested `Viewport` instead.
`initTweeq()` remains available for provider-less legacy roots that already
provide a `.TqViewport` style root. Do not combine it with `App` or
`TweeqProvider`; it configures a separate compatibility runtime.

## Replace the component namespace

The compatibility namespace returned by `useTweeq()` is deprecated and will
be removed in `@tweeq/vue` 2.0.0. Replace `Tq.Component` access with named
imports:

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {App, InputNumber, Parameter, ParameterGrid} from '@tweeq/vue'

const opacity = ref(1)
</script>

<template>
  <App app-id="com.example.app">
    <ParameterGrid>
      <Parameter label="Opacity">
        <InputNumber v-model="opacity" :min="0" :max="1" />
      </Parameter>
    </ParameterGrid>
  </App>
</template>
```

Call named store composables from descendants of `App` or `TweeqProvider` so
they resolve the injected runtime. Run the application's typecheck and browser
tests after migrating, especially for persisted state and modal workflows.
