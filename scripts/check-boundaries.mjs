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
	/(?:^|\n)\s*(?:(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\))/g
const compatibilityStoreNames = new Set([
	'actionsStore',
	'appConfigStore',
	'modalStore',
	'multiSelectStore',
	'themeStore',
	'inputTimeFormatEntry',
])
const domNamedImportPattern =
	/import\s*{([^}]*)}\s*from\s*['"]@tweeq\/dom['"]/gs

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
	const manifest = JSON.parse(readFileSync(join(root, pkg, 'package.json'), 'utf8'))
	const declaredDependencies = new Set([
		...Object.keys(manifest.dependencies ?? {}),
		...Object.keys(manifest.devDependencies ?? {}),
		...Object.keys(manifest.peerDependencies ?? {}),
		...Object.keys(manifest.optionalDependencies ?? {}),
	])
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
			const spec = match[1] ?? match[2] ?? match[3]
			if (!spec || spec.startsWith('.')) continue
			const hit = forbidden.find(f => spec === f || spec.startsWith(f + '/'))
			if (hit) {
				console.error(`✗ ${rel}: forbidden import '${spec}' (${pkg} may not depend on ${hit})`)
				failures++
			}
			const owner = spec.startsWith('@')
				? spec.split('/').slice(0, 2).join('/')
				: spec.split('/')[0]
			if (
				owner.startsWith('@tweeq/') &&
				owner !== manifest.name &&
				!declaredDependencies.has(owner)
			) {
				console.error(`✗ ${rel}: undeclared workspace dependency '${owner}'`)
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
		if (
			pkg === 'packages/dom' &&
			!file.endsWith('.test.ts') &&
			/export\s+const\s+\w+Store\s*=\s*createStore\b/.test(text)
		) {
			console.error(`✗ ${rel}: DOM stores must be created by exported factories`)
			failures++
		}
		if (pkg === 'packages/react' || pkg === 'packages/vue') {
			for (const match of text.matchAll(domNamedImportPattern)) {
				const imported = match[1]
					.split(',')
					.map(name => name.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0])
				const shared = imported.find(name => compatibilityStoreNames.has(name))
				if (shared) {
					console.error(
						`✗ ${rel}: renderer internals must resolve '${shared}' from an injected TweeqRuntime`,
					)
					failures++
				}
			}
		}
	}
}

const packageDirs = readdirSync(join(root, 'packages'))
const workspace = new Map()
for (const dir of packageDirs) {
	const manifestPath = join(root, 'packages', dir, 'package.json')
	let manifest
	try {
		manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
	} catch {
		continue
	}
	workspace.set(manifest.name, {dir: `packages/${dir}`, manifest})
}

const visiting = new Set()
const visited = new Set()
function visitPackage(name, path = []) {
	if (visiting.has(name)) {
		console.error(`✗ workspace dependency cycle: ${[...path, name].join(' -> ')}`)
		failures++
		return
	}
	if (visited.has(name)) return
	const item = workspace.get(name)
	if (!item) return
	visiting.add(name)
	const dependencies = new Set([
		...Object.keys(item.manifest.dependencies ?? {}),
		...Object.keys(item.manifest.devDependencies ?? {}),
		...Object.keys(item.manifest.optionalDependencies ?? {}),
	])
	for (const dependency of dependencies) {
		if (workspace.has(dependency)) visitPackage(dependency, [...path, name])
	}
	visiting.delete(name)
	visited.add(name)
}

for (const name of workspace.keys()) visitPackage(name)

if (failures > 0) {
	console.error(`\n${failures} boundary violation(s).`)
	process.exit(1)
}
console.log('✓ package boundaries hold')
