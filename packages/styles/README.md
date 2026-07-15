# @tweeq/styles

The canonical compiled visual system shared byte-for-byte by Tweeq's React and
Vue renderers.

```css
@import '@tweeq/styles/style.css';
```

Applications normally import `@tweeq/react/style.css` or
`@tweeq/vue/style.css`; both aliases contain this same artifact. Render Tweeq
controls under the renderer's `App` or `Viewport` style root.

The package name remains private until the repository publishing ADR's npm
ownership requirements are satisfied.
