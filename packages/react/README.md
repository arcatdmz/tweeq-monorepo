# @tweeq/react

React renderer for Tweeq. Package names remain private workspace names until
the npm ownership decision in the repository publishing ADR is unlocked.

## Install

```sh
npm install @tweeq/react react react-dom
```

Import the canonical stylesheet once at the application entry:

```tsx
import '@tweeq/react/style.css'
import {App, InputNumber, TweeqProvider, Viewport} from '@tweeq/react'
```

`App` owns an isolated runtime and its viewport. For a custom shell, place one
`Viewport` inside `TweeqProvider`; that viewport reuses the provider runtime. A
viewport without an ancestor provider creates its own runtime. Pass `appId` and
theme defaults to the component that owns the runtime.

`@tweeq/core` and `@tweeq/dom` are normal dependencies of this renderer and do
not need to be installed separately unless an application imports them
directly.

## Browser and SSR support

The supported browser target is the latest two major Chromium versions with
native Popover API and CSS anchor positioning. Current Firefox and Safari are
best effort; consumers own any polyfills. Importing the package and rendering
its static component output is SSR-safe, while pointer, popover, WebGL, and
editor interactions activate only in a browser.

`InputCode` and `MonacoEditor` lazily install the renderer's bundled editor
worker. If the host already defines Monaco's `getWorker` or `getWorkerUrl`
hook, Tweeq preserves that configuration.

See the repository React migration guide and packed `examples/react-vite`
application for complete setup.
