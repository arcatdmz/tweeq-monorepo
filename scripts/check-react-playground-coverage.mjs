#!/usr/bin/env node
import {readdirSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const componentBarrel = readFileSync(
	resolve(root, 'packages/react/src/index.ts'),
	'utf8',
)
const publicModules = [
	...new Set(
		[...componentBarrel.matchAll(/from '\.\/components\/([^']+)'/g)].map(
			match => match[1],
		),
	),
]
const sectionModules = readdirSync(
	resolve(root, 'apps/playground-react/src/sections'),
)
	.filter(name => name.endsWith('Section.tsx'))
	.map(name => name.replace(/Section\.tsx$/, ''))
const gallery = readFileSync(
	resolve(root, 'apps/playground-react/src/ComponentGallery.tsx'),
	'utf8',
)

const outerModules = ['TweeqProvider']
const represented = new Set([...sectionModules, ...outerModules])
const missing = publicModules.filter(name => !represented.has(name))
const extras = [...represented].filter(name => !publicModules.includes(name))
const missingMarkers = outerModules.filter(
	name => !gallery.includes(`data-gallery-component="${name}"`),
)

if (missing.length > 0 || extras.length > 0 || missingMarkers.length > 0) {
	throw new Error(
		[
			'React playground does not cover the public component modules.',
			missing.length > 0 ? `Missing: ${missing.join(', ')}` : '',
			extras.length > 0 ? `Unknown sections: ${extras.join(', ')}` : '',
			missingMarkers.length > 0
				? `Missing owner markers: ${missingMarkers.join(', ')}`
				: '',
		]
			.filter(Boolean)
			.join('\n'),
	)
}

console.log(`✓ React playground covers ${publicModules.length} public component modules`)
