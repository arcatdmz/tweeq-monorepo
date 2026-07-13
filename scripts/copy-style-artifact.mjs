#!/usr/bin/env node
import {copyFileSync, mkdirSync, readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const renderer = process.argv[2]

if (renderer !== 'react' && renderer !== 'vue') {
	throw new Error('renderer must be react or vue')
}

const canonical = join(root, 'packages/styles/dist/style.css')
const targetDirectory = join(root, 'packages', renderer, 'dist')
const target = join(targetDirectory, 'style.css')
const canonicalContents = readFileSync(canonical)

if (!canonicalContents.includes(Buffer.from('.monaco-editor'))) {
	throw new Error('@tweeq/styles is missing the shared Monaco base CSS')
}

mkdirSync(targetDirectory, {recursive: true})
copyFileSync(canonical, target)

if (!canonicalContents.equals(readFileSync(target))) {
	throw new Error(`@tweeq/${renderer}/style.css differs from @tweeq/styles`)
}

console.log(`copied canonical style artifact to @tweeq/${renderer}`)
