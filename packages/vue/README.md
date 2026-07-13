# @tweeq/vue

Vue 3 renderer for Tweeq. Package names remain private workspace names until
the npm ownership decision in the repository publishing ADR is unlocked.

## Install

```sh
npm install @tweeq/vue vue
```

Import the canonical stylesheet once at the application entry:

```ts
import '@tweeq/vue/style.css'
import {App, InputNumber, TweeqProvider, Viewport} from '@tweeq/vue'
```

`App` owns an isolated runtime and its viewport. For a custom shell, place one
`Viewport` inside `TweeqProvider`; that viewport reuses the provider runtime. A
viewport without an ancestor provider creates its own runtime. Pass `appId` and
theme defaults to the component that owns the runtime. `initTweeq()` remains
available for explicitly provider-less legacy roots that already provide a
`.TqViewport` style root. It configures a separate compatibility runtime and
must not be combined with `App` or `TweeqProvider`.

`@tweeq/core` and `@tweeq/dom` are normal dependencies of this renderer and do
not need to be installed separately unless an application imports them
directly.

## Browser and SSR support

The supported browser target is the latest two major Chromium versions with
native Popover API and CSS anchor positioning. Current Firefox and Safari are
best effort; consumers own any polyfills. Importing the package and rendering
its static component output is SSR-safe, while pointer, popover, WebGL, and
editor interactions activate only in a browser.

See the repository Vue migration guide and packed `examples/vue-vite`
application for complete setup.
