# Migrating an existing Vue application

This guide moves an application from the original `baku89/tweeq` package to
the maintained Vue 3 renderer. The renderer keeps Vue conventions: components
use `v-model`, named slots remain slots, and application setup uses
`initTweeq`.

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

## 2. Keep initialization, change its import

```ts
import {initTweeq} from '@tweeq/vue'

initTweeq('com.example.app', {
  colorMode: 'dark',
  accentColor: '#ff0000',
})
```

Call initialization before mounting the application, as before.

## 3. Replace the component namespace

Existing applications may temporarily keep the old namespace shape:

```ts
import {useTweeq} from '@tweeq/vue'

const Tq = useTweeq()
```

The component properties returned by this compatibility facade are deprecated.
They emit one warning per runtime and will be removed in `@tweeq/vue` 2.0.0.
Move components to direct imports:

```vue
<script setup lang="ts">
import {InputNumber, Parameter, ParameterGrid} from '@tweeq/vue'
import {ref} from 'vue'

const opacity = ref(1)
</script>

<template>
  <ParameterGrid>
    <Parameter label="Opacity">
      <InputNumber v-model="opacity" :min="0" :max="1" />
    </Parameter>
  </ParameterGrid>
</template>
```

Store access remains available from the named Vue store composables. Do not
introduce new `Tq.Component` call sites while completing this migration.

## 4. Verify behavior

Run the application's typecheck and browser tests. Pay particular attention to
controlled modal flows, disabled controls, persisted tabs, and initial ZUI
transforms; these areas now use the cross-renderer behavior contracts recorded
in the parity matrix.

