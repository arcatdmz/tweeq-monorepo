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
import {App, InputNumber, TweeqProvider} from '@tweeq/vue'
```

`App`, `TweeqProvider`, and a standalone `Viewport` each establish an isolated
application runtime; do not nest them unless the inner application is
intentionally independent. Pass `appId` and theme defaults to the component
that owns the runtime. `initTweeq()` remains available for explicitly
provider-less legacy roots.

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
