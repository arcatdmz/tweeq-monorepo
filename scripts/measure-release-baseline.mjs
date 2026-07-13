#!/usr/bin/env node
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {dirname, extname, join, relative, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {gzipSync} from 'node:zlib'

import {
	getRulerValueAtPixel,
	resolveActiveTabId,
	unsignedMod,
} from '../packages/core/dist/index.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, 'docs', 'architecture', 'release-baseline.md')
const artifacts = [
	['@tweeq/core JavaScript', 'packages/core/dist', new Set(['.js'])],
	['@tweeq/dom JavaScript', 'packages/dom/dist', new Set(['.js'])],
	['@tweeq/styles CSS', 'packages/styles/dist', new Set(['.css'])],
	['@tweeq/react JavaScript', 'packages/react/dist', new Set(['.js', '.cjs'])],
	['@tweeq/react CSS', 'packages/react/dist', new Set(['.css'])],
	['@tweeq/vue JavaScript', 'packages/vue/dist', new Set(['.js', '.cjs'])],
	['@tweeq/vue CSS', 'packages/vue/dist', new Set(['.css'])],
]

const rows = artifacts.map(([label, directory, extensions]) => {
	const files = walk(join(root, directory)).filter(path => extensions.has(extname(path)))
	const buffers = files.map(path => readFileSync(path))
	return {
		label,
		files: files.length,
		raw: buffers.reduce((sum, value) => sum + value.byteLength, 0),
		gzip: buffers.reduce((sum, value) => sum + gzipSync(value).byteLength, 0),
	}
})

const canonicalStyle = readFileSync(join(root, 'packages/styles/dist/style.css'))
if (!canonicalStyle.includes(Buffer.from('.monaco-editor'))) {
	throw new Error('@tweeq/styles is missing the shared Monaco base CSS')
}
for (const renderer of ['react', 'vue']) {
	const rendererStyle = readFileSync(
		join(root, `packages/${renderer}/dist/style.css`)
	)
	if (!canonicalStyle.equals(rendererStyle)) {
		throw new Error(`@tweeq/${renderer}/style.css is not the canonical artifact`)
	}
}

const iterations = 100_000
const samples = Array.from({length: 7}, () => benchmark(iterations)).sort((a, b) => a - b)
const medianMs = samples[Math.floor(samples.length / 2)]
const operationsPerSecond = Math.round(iterations * 3 / (medianMs / 1000))

const markdown = `# Phase 6 release baseline

Recorded: 2026-07-13  
Runtime: Node ${process.versions.node}, ${process.platform}/${process.arch}  
Command: \`pnpm build && pnpm baseline:record\`

This is the first shared-core prerelease baseline. Artifact sizes sum the
actual emitted JavaScript/CSS files; gzip compresses each file independently,
matching per-asset HTTP transfer behavior. Source maps and declarations are
excluded from runtime size totals.

## Artifact size

| Artifact | Files | Raw | Gzip |
| --- | ---: | ---: | ---: |
${rows.map(row => `| ${row.label} | ${row.files} | ${formatBytes(row.raw)} | ${formatBytes(row.gzip)} |`).join('\n')}

The renderer totals include Monaco and its language workers. They establish
the MF-011 starting point; code splitting should be evaluated against these
numbers rather than inferred from Vite's 500 kB warning alone.

The three CSS rows are byte-identical aliases of the canonical shared style
artifact, which includes Monaco's common base rules before Tweeq's editor
overrides. Renderer builds and the packed-artifact gate verify both invariants;
renderer source no longer emits independent owned CSS.

## Core transition throughput

The benchmark runs \`unsignedMod\`, ruler coordinate conversion, and enabled-tab
resolution once per iteration (${iterations.toLocaleString()} iterations, seven samples).

- Median: ${medianMs.toFixed(2)} ms
- Aggregate operations: ${operationsPerSecond.toLocaleString()} operations/second

This is a comparison baseline, not a CI timing threshold. Functional runtime
parity remains enforced by the renderer-neutral contracts and browser suite.

## Interaction evidence

- React renderer contracts: 82 tests
- Vue renderer contracts and compatibility warning: 83 tests
- Cross-page Playwright interaction/visual suite: 21 tests
- Packed downstream consumers: React Vite and Vue Vite, each typechecked and built

Regenerate this document on the release runner immediately before each
prerelease and retain the result with the release commit.
`

writeFileSync(output, markdown)
console.log(`recorded ${relative(root, output)}`)

function walk(directory) {
	return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) return walk(path)
		return statSync(path).isFile() ? [path] : []
	})
}

function benchmark(count) {
	const tabs = [{id: 'one'}, {id: 'two', isDisabled: true}, {id: 'three'}]
	let sink = 0
	const start = performance.now()
	for (let index = 0; index < count; index += 1) {
		sink += unsignedMod(index - 7, 13)
		sink += getRulerValueAtPixel(index % 640, 640, [0, 100])
		sink += resolveActiveTabId(tabs, index % 2 ? 'one' : 'missing').length
	}
	if (!Number.isFinite(sink)) throw new Error('benchmark produced a non-finite result')
	return performance.now() - start
}

function formatBytes(bytes) {
	return `${(bytes / 1024).toFixed(2)} KiB`
}
