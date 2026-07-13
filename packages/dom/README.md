# @tweeq/dom

Framework-neutral browser controllers, gestures, runtime stores, theme DOM
binding, and explicit lifecycle factories for Tweeq renderers.

```sh
npm install @tweeq/dom
```

Most applications should install `@tweeq/react` or `@tweeq/vue` instead; each
renderer installs DOM and core transitively. Module imports are SSR-safe.
Browser listeners and writes begin only when an application creates and binds
a runtime or controller, and owners must dispose those resources.

The Monaco environment adapter is likewise explicit: renderers call it when
an editor mounts, and an existing host worker configuration always wins.

The package name remains private until the repository publishing ADR's npm
ownership requirements are satisfied.
