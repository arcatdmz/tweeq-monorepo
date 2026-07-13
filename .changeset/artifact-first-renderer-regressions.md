---
'@tweeq/dom': patch
'@tweeq/styles': patch
'@tweeq/react': patch
'@tweeq/vue': patch
---

Make workspace applications consume built package exports, keep renderer worker
assets relative to their deployed package, and repair the color-drag, composite
layout, host-list-style, and Iconify-registry regressions exposed by that path.
