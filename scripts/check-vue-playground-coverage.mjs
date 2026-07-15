#!/usr/bin/env node
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const componentBarrel = readFileSync(
	resolve(root, 'packages/vue/src/components.ts'),
	'utf8',
)
const gallery = readFileSync(
	resolve(root, 'apps/playground-vue/src/ComponentGallery.vue'),
	'utf8',
)
const publicModules = [
	...componentBarrel.matchAll(/^export \* from '\.\/([^']+)'/gm),
].map(match => match[1])
const markers = [
	...gallery.matchAll(/data-gallery-component="([^"]+)"/g),
].map(match => match[1])
const markerCounts = new Map(
	markers.map(name => [name, markers.filter(marker => marker === name).length]),
)
const missing = publicModules.filter(name => !markerCounts.has(name))
const duplicates = publicModules.filter(name => markerCounts.get(name) !== 1)

if (missing.length > 0 || duplicates.length > 0) {
	throw new Error(
		[
			'Vue playground does not cover the public component barrel.',
			missing.length > 0 ? `Missing: ${missing.join(', ')}` : '',
			duplicates.length > 0 ? `Not represented exactly once: ${duplicates.join(', ')}` : '',
		]
			.filter(Boolean)
			.join('\n'),
	)
}

console.log(`✓ Vue playground covers ${publicModules.length} public component modules`)
