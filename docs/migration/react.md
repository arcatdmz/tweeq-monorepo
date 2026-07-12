# Migrating the React fork

This guide moves an application from the pre-monorepo React fork to the
maintained React renderer. React keeps controlled `value` / `onChange`
semantics and provider-based application setup.

> The `@tweeq/*` package names are workspace names until npm ownership is
> settled. Follow ADR 0001 before using them from the public registry.

## 1. Change the package entry and stylesheet

Replace imports from the old unscoped entry:

```diff
- import {InputNumber, TweeqProvider} from 'tweeq'
- import 'tweeq/style.css'
+ import {InputNumber, TweeqProvider} from '@tweeq/react'
+ import '@tweeq/react/style.css'
```

Install the renderer and its peers:

```sh
pnpm add @tweeq/react react react-dom
```

The old unscoped `tweeq` entry is not published by this workspace. There is no
silent cross-renderer alias: imports must name `@tweeq/react` explicitly.

## 2. Keep controlled component semantics

```tsx
import {useState} from 'react'
import {InputNumber, TweeqProvider, Viewport} from '@tweeq/react'

export function Example() {
  const [value, setValue] = useState(24)

  return <TweeqProvider appId="com.example.app">
    <Viewport appId="com.example.app">
      <InputNumber value={value} onChange={setValue} min={0} max={100} />
    </Viewport>
  </TweeqProvider>
}
```

`App` includes a viewport and, by default, a provider. Set `withProvider={false}`
only when an ancestor already owns the Tweeq provider lifecycle.

## 3. Verify behavior

Run the application's typecheck and browser tests. The public renderer entry
continues to re-export shared value types and stores for compatibility, while
framework-neutral implementation imports should use `@tweeq/core` or
`@tweeq/dom` directly in new library code.

