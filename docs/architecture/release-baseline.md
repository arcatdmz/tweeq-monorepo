# Phase 6 release baseline

Recorded: 2026-07-15 (Asia/Tokyo)
Runtime: Node 24.15.0, linux/x64
Command: `pnpm build && pnpm baseline:record`

This is the completed shared-core migration baseline and can seed a future
prerelease. Artifact sizes sum the
actual emitted JavaScript/CSS files; gzip compresses each file independently,
matching per-asset HTTP transfer behavior. Source maps and declarations are
excluded from runtime size totals.

## Artifact size

| Artifact | Files | Raw | Gzip |
| --- | ---: | ---: | ---: |
| @tweeq/core JavaScript | 35 | 77.64 KiB | 26.76 KiB |
| @tweeq/dom JavaScript | 17 | 54.69 KiB | 17.07 KiB |
| @tweeq/styles CSS | 1 | 365.79 KiB | 98.34 KiB |
| @tweeq/react JavaScript | 179 | 19872.45 KiB | 4942.88 KiB |
| @tweeq/react CSS | 1 | 365.79 KiB | 98.34 KiB |
| @tweeq/vue JavaScript | 182 | 25008.56 KiB | 6309.85 KiB |
| @tweeq/vue CSS | 1 | 365.79 KiB | 98.34 KiB |

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

- Median: 2.60 ms
- Aggregate operations: 115,172,698 operations/second

This is a comparison baseline, not a CI timing threshold. Functional runtime
parity remains enforced by the renderer-neutral contracts and browser suite.

## Interaction evidence

- React renderer contracts: 90 tests
- Vue renderer contracts and compatibility warning: 89 tests
- Cross-page Playwright interaction/visual suite: 35 tests
- Packed downstream consumers: React Vite and Vue Vite, each typechecked and built

Regenerate this document on the release runner immediately before each
prerelease and retain the result with the release commit.
