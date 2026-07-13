# Migrating an existing Vue application

This guide moves an application from the original `baku89/tweeq` package to
the maintained Vue 3 renderer. The renderer keeps Vue conventions: components
use `v-model`, named slots remain slots, and `App` or `TweeqProvider` owns one
isolated application runtime.

The complete [`examples/vue-vite`](../../examples/vue-vite) consumer is the
executable form of these snippets. CI installs packed package artifacts,
typechecks that application, and builds it outside the workspace.

> The `@tweeq/*` package names are workspace names until npm ownership is
> settled. Follow ADR 0001 before using them from the public registry.

## 1. Change dependencies and styles

Remove the old Tweeq package and Pinia if no other application code uses it,
then install the Vue renderer:

```sh
pnpm remove baku89/tweeq
pnpm add @tweeq/vue vue
```

```ts
import '@tweeq/vue/style.css'
```

The renderer no longer needs a Tweeq-specific Pinia installation. Its stores
are adapters over the shared DOM package.

## 2. Move initialization to the application owner

Pass the old initialization values to `App`, which owns both the runtime and
the required viewport style scope:

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
`initTweeq()` remains available only for provider-less legacy roots that
already supply a `.TqViewport` style root. Do not call it alongside `App` or
`TweeqProvider`: it configures the separate provider-less compatibility
runtime, not the runtime injected by those components.

## 3. Replace the component namespace

Existing applications may temporarily keep the old namespace shape:

```ts
import {useTweeq} from '@tweeq/vue'

const Tq = useTweeq()
```

The component properties returned by this compatibility facade are deprecated.
The facade emits one warning per JavaScript session and will be removed in
`@tweeq/vue` 2.0.0.
Under an `App`/`TweeqProvider`, use this facade only as a temporary component
namespace: its store properties belong to the separate provider-less runtime.
Move components to direct imports:

```vue
<script setup lang="ts">
import {App, InputNumber, Parameter, ParameterGrid} from '@tweeq/vue'
import {ref} from 'vue'

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

Store access remains available from the named Vue store composables. Call
those composables from a descendant component rendered inside `App` or
`TweeqProvider` so they resolve the injected application runtime. Do not
introduce new `Tq.Component` call sites while completing this migration.

## 4. Verify behavior

Run the application's typecheck and browser tests. Pay particular attention to
controlled modal flows, disabled controls, persisted tabs, and initial ZUI
transforms; these areas now use the cross-renderer behavior contracts recorded
in the parity matrix.
