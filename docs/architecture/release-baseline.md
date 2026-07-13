# Phase 6 release baseline

Recorded: 2026-07-13  
Runtime: Node 24.16.0, linux/x64  
Command: `pnpm build && pnpm baseline:record`

This is the first shared-core prerelease baseline. Artifact sizes sum the
actual emitted JavaScript/CSS files; gzip compresses each file independently,
matching per-asset HTTP transfer behavior. Source maps and declarations are
excluded from runtime size totals.

## Artifact size

| Artifact | Files | Raw | Gzip |
| --- | ---: | ---: | ---: |
| @tweeq/core JavaScript | 35 | 74.88 KiB | 25.90 KiB |
| @tweeq/dom JavaScript | 14 | 42.14 KiB | 14.07 KiB |
| @tweeq/styles CSS | 1 | 362.91 KiB | 97.99 KiB |
| @tweeq/react JavaScript | 174 | 11672.84 KiB | 3009.82 KiB |
| @tweeq/react CSS | 1 | 362.91 KiB | 97.99 KiB |
| @tweeq/vue JavaScript | 177 | 16753.44 KiB | 4356.20 KiB |
| @tweeq/vue CSS | 1 | 362.91 KiB | 97.99 KiB |

The renderer totals include Monaco and its language workers. They establish
the MF-011 starting point; code splitting should be evaluated against these
numbers rather than inferred from Vite's 500 kB warning alone.

The three CSS rows are byte-identical aliases of the canonical shared style
artifact, which includes Monaco's common base rules before Tweeq's editor
overrides. Renderer builds and the packed-artifact gate verify both invariants;
renderer source no longer emits independent owned CSS.

## Core transition throughput

The benchmark runs `unsignedMod`, ruler coordinate conversion, and enabled-tab
resolution once per iteration (100,000 iterations, seven samples).

- Median: 3.02 ms
- Aggregate operations: 99,490,278 operations/second

This is a comparison baseline, not a CI timing threshold. Functional runtime
parity remains enforced by the renderer-neutral contracts and browser suite.

## Interaction evidence

- React renderer contracts: 82 tests
- Vue renderer contracts and compatibility warning: 83 tests
- Cross-page Playwright interaction/visual suite: 21 tests
- Packed downstream consumers: React Vite and Vue Vite, each typechecked and built

Regenerate this document on the release runner immediately before each
prerelease and retain the result with the release commit.
