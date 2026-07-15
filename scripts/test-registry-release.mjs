#!/usr/bin/env node
import {execSync} from 'node:child_process'
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const version = process.env.TWEEQ_RELEASE_VERSION
if (!/^\d+\.\d+\.\d+(?:-(?:next|rc)\.\d+)?$/.test(version ?? '')) {
	throw new Error('TWEEQ_RELEASE_VERSION must be an explicit stable, next, or rc version')
}

const scratch = mkdtempSync(join(tmpdir(), 'tweeq-registry-release-'))
try {
	for (const example of ['react-vite', 'vue-vite']) {
		const destination = join(scratch, example)
		cpSync(join(root, 'examples', example), destination, {
			recursive: true,
			filter: path => !path.includes('node_modules') && !path.endsWith('/dist'),
		})
		const manifestPath = join(destination, 'package.json')
		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
		for (const dependencies of [manifest.dependencies, manifest.devDependencies]) {
			if (!dependencies) continue
			for (const [name, range] of Object.entries(dependencies)) {
				if (name.startsWith('@tweeq/')) dependencies[name] = version
				else if (range === 'catalog:') dependencies[name] = catalogRange(name)
			}
		}
		writeFileSync(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`)
		writeFileSync(
			join(destination, 'pnpm-workspace.yaml'),
			'packages: []\nallowBuilds:\n  esbuild: true\n  vue-demi: true\n',
		)
		run('pnpm install --no-frozen-lockfile', destination)
		run('pnpm run typecheck', destination)
		run('pnpm exec vite build', destination)
		console.log(`registry release consumer OK: ${example}`)
	}
} finally {
	rmSync(scratch, {recursive: true, force: true})
}

function run(command, cwd) {
	execSync(command, {cwd, stdio: 'inherit'})
}

function catalogRange(dependency) {
	const workspace = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
	const escaped = dependency.replace(/[/@]/g, character => `\\${character}`)
	const match = workspace.match(new RegExp(`^\\s+'?${escaped}'?: (.+)$`, 'm'))
	if (!match) throw new Error(`no catalog entry for ${dependency}`)
	return match[1].trim()
}
