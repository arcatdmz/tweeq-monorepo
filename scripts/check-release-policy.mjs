#!/usr/bin/env node
import {readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicPackages = ['core', 'dom', 'styles', 'react', 'vue']
const releaseMode = process.argv.includes('--release')
const manifests = publicPackages.map(directory => ({
	directory,
	manifest: JSON.parse(readFileSync(join(root, 'packages', directory, 'package.json'), 'utf8')),
}))
const failures = []

for (const {directory, manifest} of manifests) {
	if (manifest.name !== `@tweeq/${directory}`) {
		failures.push(`${directory}: unexpected package name ${manifest.name}`)
	}
	if (releaseMode) {
		if (manifest.private === true) failures.push(`${manifest.name}: still private`)
		if (!/^\d+\.\d+\.\d+-(?:next|rc)\.\d+$/.test(manifest.version)) {
			failures.push(`${manifest.name}: ${manifest.version} is not a next/rc prerelease`)
		}
		if (manifest.publishConfig?.access !== 'restricted') {
			failures.push(`${manifest.name}: publishConfig.access must be restricted`)
		}
		if (manifest.publishConfig?.registry !== 'https://registry.npmjs.org/') {
			failures.push(`${manifest.name}: publishConfig.registry must be the npm registry`)
		}
	} else if (manifest.private !== true) {
		failures.push(`${manifest.name}: must remain private before the publishing ADR is unlocked`)
	}
}

if (releaseMode && process.env.NPM_SCOPE_APPROVED !== '@tweeq') {
	failures.push('NPM_SCOPE_APPROVED must equal @tweeq (protected environment secret)')
}

if (failures.length) throw new Error(`Release policy failed:\n${failures.join('\n')}`)
console.log(releaseMode ? 'prerelease policy holds' : 'pre-ownership publish guard holds')
