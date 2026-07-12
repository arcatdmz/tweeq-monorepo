#!/usr/bin/env node
/* global console, URL */
/**
 * ADR 0002 smoke test: every JavaScript package entry must be importable by
 * plain Node without DOM globals or bundler-only resolution behavior.
 */
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

const root = resolve(new URL('..', import.meta.url).pathname)
const entries = [
	['@tweeq/core', 'packages/core/dist/index.js'],
	['@tweeq/core/validator', 'packages/core/dist/validator.js'],
	['@tweeq/dom', 'packages/dom/dist/index.js'],
	['@tweeq/react', 'packages/react/dist/index.es.js'],
	['@tweeq/vue', 'packages/vue/dist/index.es.js'],
]

for (const [name, entry] of entries) {
	await import(pathToFileURL(resolve(root, entry)).href)
	console.log(`SSR import OK: ${name}`)
}

const require = createRequire(import.meta.url)
for (const [name, entry] of [
	['@tweeq/react', 'packages/react/dist/index.cjs'],
	['@tweeq/vue', 'packages/vue/dist/index.cjs'],
]) {
	require(resolve(root, entry))
	console.log(`CJS require OK: ${name}`)
}
