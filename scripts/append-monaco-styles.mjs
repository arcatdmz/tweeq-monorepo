#!/usr/bin/env node
import {createRequire} from 'node:module'
import {readFileSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stylesDirectory = join(root, 'packages/styles')
const output = join(stylesDirectory, 'dist/style.css')
const require = createRequire(join(stylesDirectory, 'package.json'))
const monacoPath = require.resolve(
	'monaco-editor/min/vs/editor/editor.main.css',
)

const shared = readFileSync(output, 'utf8')
const monaco = readFileSync(monacoPath, 'utf8').trim()
const importEnd = shared.indexOf(';') + 1

if (!shared.startsWith('@import ') || importEnd === 0) {
	throw new Error('@tweeq/styles must begin with its external font @import')
}
if (!monaco.includes('.monaco-editor')) {
	throw new Error('resolved Monaco stylesheet does not contain editor rules')
}
if (monaco.includes('@import')) {
	throw new Error('Monaco stylesheet unexpectedly contains a CSS @import')
}

// Keep the external font import first, then the vendor base, then Tweeq's
// canonical rules so Tweeq's Monaco wrapper customizations win the cascade.
writeFileSync(
	output,
	`${shared.slice(0, importEnd)}\n${monaco}\n${shared.slice(importEnd)}\n`,
)

console.log('included Monaco base CSS in @tweeq/styles/style.css')
