---
'@tweeq/dom': patch
'@tweeq/react': patch
'@tweeq/vue': patch
---

Correct package artifact contracts by providing a working Vue CommonJS entry,
excluding tests and implementation source from tarballs, and removing stale
renderer runtime dependencies left by the workspace relocation.
