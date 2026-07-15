---
'@tweeq/core': patch
'@tweeq/dom': patch
'@tweeq/vue': patch
---

Make the core, DOM, and Vue package entry points safe to import in plain Node
without relying on bundler-only module resolution or browser globals.
