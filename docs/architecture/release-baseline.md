# Phase 6 release baseline

Recorded: 2026-07-14 (Asia/Tokyo)
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
| @tweeq/dom JavaScript | 17 | 52.41 KiB | 16.40 KiB |
| @tweeq/styles CSS | 1 | 362.91 KiB | 97.99 KiB |
| @tweeq/react JavaScript | 179 | 19899.14 KiB | 4952.24 KiB |
| @tweeq/react CSS | 1 | 362.91 KiB | 97.99 KiB |
| @tweeq/vue JavaScript | 182 | 24980.41 KiB | 6301.27 KiB |
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

- Median: 3.33 ms
- Aggregate operations: 89,977,470 operations/second

This is a comparison baseline, not a CI timing threshold. Functional runtime
parity remains enforced by the renderer-neutral contracts and browser suite.

## Interaction evidence

- React renderer contracts: 85 tests
- Vue renderer contracts and compatibility warning: 84 tests
- Cross-page Playwright interaction/visual suite: 23 tests
- Packed downstream consumers: React Vite and Vue Vite, each typechecked and built

Regenerate this document on the release runner immediately before each
prerelease and retain the result with the release commit.
