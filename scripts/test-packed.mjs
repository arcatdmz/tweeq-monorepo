#!/usr/bin/env node
/**
 * Packed-package smoke test (plan §7, CI gate 9): `pnpm pack` every public
 * package, install the tarballs into copies of the clean example apps
 * outside the workspace, and build them. Catches missing files, bad export
 * maps, accidental source aliases, and undeclared dependencies.
 *
 * Packages remain `"private": true` until the publishing ADR is resolved;
 * packing is an artifact check only and never mutates or publishes manifests.
 */
import {execFileSync, execSync} from 'node:child_process'
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const publicPackages = ['core', 'dom', 'styles', 'react', 'vue']
const examples = ['react-vite', 'vue-vite']

const scratch = mkdtempSync(join(tmpdir(), 'tweeq-packed-'))
const tarballDir = join(scratch, 'tarballs')

function run(cmd, cwd) {
	execSync(cmd, {cwd, stdio: ['ignore', 'inherit', 'inherit']})
}

const tarballs = {}
const packedStyles = {}
try {
	// 1. Build and pack every public package.
	run(`pnpm --filter './packages/*' build`, root)
	for (const name of publicPackages) {
		const dir = join(root, 'packages', name)
		const out = execSync(
			`pnpm pack --pack-destination ${JSON.stringify(tarballDir)}`,
			{cwd: dir, encoding: 'utf8'},
		)
		const tarball = out.trim().split('\n').at(-1)
		tarballs[`@tweeq/${name}`] = tarball
		if (name === 'styles' || name === 'react' || name === 'vue') {
			packedStyles[name] = execFileSync('tar', [
				'-xOf',
				tarball,
				'package/dist/style.css',
			])
		}
		const packedFiles = execSync(`tar -tf ${JSON.stringify(tarball)}`, {
			encoding: 'utf8',
		}).trim().split('\n')
		const packedTests = packedFiles.filter(file => /\.test\.[^/]+$/.test(file))
		if (packedTests.length > 0) {
			throw new Error(
				`@tweeq/${name} packed test files:\n${packedTests.join('\n')}`,
			)
		}
		console.log(`packed @tweeq/${name} -> ${tarball}`)
	}
	for (const renderer of ['react', 'vue']) {
		if (!packedStyles.styles.equals(packedStyles[renderer])) {
			throw new Error(
				`@tweeq/${renderer}/style.css differs from packed @tweeq/styles artifact`,
			)
		}
	}
	if (!packedStyles.styles.includes(Buffer.from('.monaco-editor'))) {
		throw new Error('packed canonical CSS is missing the Monaco base rules')
	}
	console.log('packed renderer style aliases match @tweeq/styles byte-for-byte')

	// 2. Install tarballs into out-of-workspace copies of the examples.
	for (const example of examples) {
		const src = join(root, 'examples', example)
		const dest = join(scratch, example)
		cpSync(src, dest, {
			recursive: true,
			filter: p => !p.includes('node_modules') && !p.endsWith('/dist'),
		})

		const manifestPath = join(dest, 'package.json')
		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
		for (const deps of [manifest.dependencies, manifest.devDependencies]) {
			if (!deps) continue
			for (const [dep, range] of Object.entries(deps)) {
				if (tarballs[dep]) deps[dep] = `file:${tarballs[dep]}`
				else if (range === 'catalog:') deps[dep] = catalogRange(dep)
			}
		}
		writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n')
		// Route the tarballs' own @tweeq/* dependencies to tarballs too.
		// (pnpm >=10 reads overrides from pnpm-workspace.yaml, not package.json.)
		writeFileSync(
			join(dest, 'pnpm-workspace.yaml'),
			'packages: []\nallowBuilds:\n  esbuild: true\n  vue-demi: true\noverrides:\n' +
				Object.entries(tarballs)
					.map(([dep, tar]) => `  '${dep}': 'file:${tar}'\n`)
					.join(''),
		)

		console.log(`\n=== ${example}: installing packed tarballs`)
		run('pnpm install --no-frozen-lockfile', dest)
		const renderer = example === 'react-vite' ? '@tweeq/react' : '@tweeq/vue'
		console.log(`=== ${example}: requiring packed CommonJS entry`)
		run(`node -e "require('${renderer}')"`, dest)
		console.log(`=== ${example}: checking packed declarations`)
		run('pnpm run typecheck', dest)
		console.log(`=== ${example}: building against packed artifacts`)
		run('pnpm exec vite build', dest)
		console.log(`=== ${example}: OK`)
	}
	console.log('\n✓ packed examples build')
} finally {
	rmSync(scratch, {recursive: true, force: true})
}

function catalogRange(dep) {
	const workspaceYaml = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
	const match = workspaceYaml.match(
		new RegExp(`^\\s+'?${dep.replace(/[/@]/g, m => '\\' + m)}'?: (.+)$`, 'm'),
	)
	if (!match) throw new Error(`no catalog entry for ${dep}`)
	return match[1].trim()
}
