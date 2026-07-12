#!/usr/bin/env node
/**
 * Dependency-boundary test (plan §8 Phase 2): a small equivalent of
 * dependency-cruiser that fails when a package imports something its layer
 * forbids (architecture rule 3) or when renderers import each other.
 */
import {readdirSync, readFileSync, statSync} from 'node:fs'
import {join, relative} from 'node:path'

const root = new URL('..', import.meta.url).pathname

/** package dir -> forbidden import specifiers (exact name or `name/…`). */
const rules = {
	'packages/core': [
		'react',
		'react-dom',
		'vue',
		'pinia',
		'@vueuse/core',
		'@iconify/react',
		'@iconify/vue',
		'@tweeq/dom',
		'@tweeq/react',
		'@tweeq/vue',
	],
	'packages/dom': [
		'react',
		'react-dom',
		'vue',
		'pinia',
		'@vueuse/core',
		'@iconify/react',
		'@iconify/vue',
		'@tweeq/react',
		'@tweeq/vue',
	],
	'packages/styles': ['react', 'react-dom', 'vue'],
	'packages/react': ['vue', 'pinia', '@vueuse/core', '@iconify/vue', '@tweeq/vue'],
	'packages/vue': ['react', 'react-dom', '@iconify/react', '@tweeq/react'],
}

/** Core additionally must not touch DOM globals (checked textually). */
const domGlobalPattern =
	/\b(?:window|document|navigator|localStorage|sessionStorage)\s*[.([]/

const importPattern =
	/(?:^|\n)\s*(?:import|export)[^'"]*?from\s*['"]([^'".][^'"]*)['"]|import\(\s*['"]([^'".][^'"]*)['"]/g

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry)
		if (statSync(path).isDirectory()) {
			if (entry !== 'node_modules' && entry !== 'dist') yield* walk(path)
		} else if (/\.(ts|tsx|vue|mts|js|mjs)$/.test(entry)) {
			yield path
		}
	}
}

let failures = 0

for (const [pkg, forbidden] of Object.entries(rules)) {
	const srcDir = join(root, pkg, 'src')
	let files
	try {
		files = [...walk(srcDir)]
	} catch {
		continue // package not populated yet
	}
	for (const file of files) {
		const text = readFileSync(file, 'utf8')
		const rel = relative(root, file)
		for (const match of text.matchAll(importPattern)) {
			const spec = match[1] ?? match[2]
			if (!spec) continue
			const hit = forbidden.find(f => spec === f || spec.startsWith(f + '/'))
			if (hit) {
				console.error(`✗ ${rel}: forbidden import '${spec}' (${pkg} may not depend on ${hit})`)
				failures++
			}
		}
		if (pkg === 'packages/core' && !file.endsWith('.test.ts')) {
			const domHit = text.match(domGlobalPattern)
			if (domHit) {
				console.error(`✗ ${rel}: core must not touch DOM global '${domHit[0].trim()}'`)
				failures++
			}
		}
	}
}

if (failures > 0) {
	console.error(`\n${failures} boundary violation(s).`)
	process.exit(1)
}
console.log('✓ package boundaries hold')
