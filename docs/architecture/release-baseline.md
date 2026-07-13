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
| @tweeq/core JavaScript | 35 | 74.85 KiB | 25.88 KiB |
| @tweeq/dom JavaScript | 14 | 42.14 KiB | 14.07 KiB |
| @tweeq/styles CSS | 1 | 33.68 KiB | 4.91 KiB |
| @tweeq/react JavaScript | 174 | 11677.37 KiB | 3014.49 KiB |
| @tweeq/react CSS | 1 | 339.36 KiB | 96.85 KiB |
| @tweeq/vue JavaScript | 177 | 16723.34 KiB | 4351.36 KiB |
| @tweeq/vue CSS | 1 | 331.37 KiB | 96.08 KiB |

The renderer totals include Monaco and its language workers. They establish
the MF-011 starting point; code splitting should be evaluated against these
numbers rather than inferred from Vite's 500 kB warning alone.

The shared-style entry contains only migrated families. Its much smaller size
than either renderer stylesheet shows that MF-044 canonical style ownership is
still incomplete; renderer CSS remains separate until that finding is closed.

## Core transition throughput

The benchmark runs `unsignedMod`, ruler coordinate conversion, and enabled-tab
resolution once per iteration (100,000 iterations, seven samples).

- Median: 1.86 ms
- Aggregate operations: 161,263,792 operations/second

This is a comparison baseline, not a CI timing threshold. Functional runtime
parity remains enforced by the renderer-neutral contracts and browser suite.

## Interaction evidence

- React renderer contracts: 76 tests
- Vue renderer contracts and compatibility warning: 77 tests
- Cross-page Playwright interaction/visual suite: 21 tests
- Packed downstream consumers: React Vite and Vue Vite, each typechecked and built

Regenerate this document on the release runner immediately before each
prerelease and retain the result with the release commit.
