#!/usr/bin/env node
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {dirname, extname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputs = [join(root, 'README.md'), ...markdownFiles(join(root, 'docs'))]
const failures = []

for (const file of inputs) {
	const text = readFileSync(file, 'utf8')
	for (const match of text.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)) {
		const raw = match[1].trim().replace(/^<|>$/g, '')
		if (!raw || raw.startsWith('#') || /^[a-z][a-z+.-]*:/i.test(raw)) continue
		const target = decodeURIComponent(raw.split('#')[0])
		if (!target) continue
		const path = resolve(dirname(file), target)
		const candidates = [path, `${path}.md`, join(path, 'index.md')]
		if (!candidates.some(existsSync)) failures.push(`${relativePath(file)} -> ${raw}`)
	}
}

if (failures.length) {
	throw new Error(`Broken documentation links:\n${failures.join('\n')}`)
}

console.log(`checked ${inputs.length} Markdown files`)

function markdownFiles(dir) {
	return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return markdownFiles(path)
		return statSync(path).isFile() && extname(path) === '.md' ? [path] : []
	})
}

function relativePath(path) {
	return path.slice(root.length + 1)
}
