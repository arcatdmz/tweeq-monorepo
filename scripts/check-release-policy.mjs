#!/usr/bin/env node
import {readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicPackages = ['core', 'dom', 'styles', 'react', 'vue']
const releaseMode = process.argv.includes('--release')
const releaseChannel = process.env.RELEASE_CHANNEL
const manifests = publicPackages.map(directory => ({
	directory,
	manifest: JSON.parse(readFileSync(join(root, 'packages', directory, 'package.json'), 'utf8')),
}))
const failures = []

for (const {directory, manifest} of manifests) {
	if (manifest.name !== `@tweeq/${directory}`) {
		failures.push(`${directory}: unexpected package name ${manifest.name}`)
	}
	if (manifest.license !== 'MIT') {
		failures.push(`${manifest.name}: license must be MIT`)
	}
	if (manifest.repository?.url !== 'https://github.com/arcatdmz/tweeq-monorepo.git') {
		failures.push(`${manifest.name}: repository URL must match the GitHub repository`)
	}
	if (manifest.repository?.directory !== `packages/${directory}`) {
		failures.push(`${manifest.name}: repository directory must identify its package`)
	}
	if (releaseMode) {
		if (manifest.private === true) failures.push(`${manifest.name}: still private`)
		const expectedVersion =
			releaseChannel === 'next'
				? /^\d+\.\d+\.\d+-(?:next|rc)\.\d+$/
				: /^\d+\.\d+\.\d+$/
		if (!expectedVersion.test(manifest.version)) {
			failures.push(
				`${manifest.name}: ${manifest.version} is not valid for the ${releaseChannel} channel`,
			)
		}
		if (manifest.publishConfig?.access !== 'public') {
			failures.push(`${manifest.name}: publishConfig.access must be public`)
		}
		if (manifest.publishConfig?.registry !== 'https://registry.npmjs.org/') {
			failures.push(`${manifest.name}: publishConfig.registry must be the npm registry`)
		}
	} else if (manifest.private !== true) {
		failures.push(`${manifest.name}: must remain private before the publishing ADR is unlocked`)
	}
}

if (releaseMode && releaseChannel !== 'next' && releaseChannel !== 'latest') {
	failures.push('RELEASE_CHANNEL must equal next or latest')
}

const releaseVersions = new Set(manifests.map(({manifest}) => manifest.version))
if (releaseMode && releaseVersions.size !== 1) {
	failures.push(
		`fixed public packages must share one version (found ${[...releaseVersions].join(', ')})`,
	)
}

if (releaseMode && process.env.NPM_SCOPE_APPROVED !== '@tweeq') {
	failures.push('NPM_SCOPE_APPROVED must equal @tweeq (protected environment secret)')
}
if (
	releaseMode &&
	releaseChannel === 'latest' &&
	process.env.STABLE_RELEASE_APPROVED !== [...releaseVersions][0]
) {
	failures.push(
		'STABLE_RELEASE_APPROVED must equal the fixed package version after a prerelease feedback cycle',
	)
}

if (failures.length) throw new Error(`Release policy failed:\n${failures.join('\n')}`)
console.log(releaseMode ? `${releaseChannel} release policy holds` : 'pre-ownership publish guard holds')
