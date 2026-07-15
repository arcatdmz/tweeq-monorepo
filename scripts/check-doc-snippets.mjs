#!/usr/bin/env node
import {readFileSync, readdirSync} from 'node:fs'
import {extname, join, relative, resolve} from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const files = [join(root, 'README.md'), ...markdownFiles(join(root, 'docs'))]
const failures = []
const legacyPatterns = [
	/(?:npm|pnpm|yarn)(?:\s+install|\s+add)\s+[^\n]*baku89\/tweeq/,
	/(?:from\s+|import\s*)['"]baku89\/tweeq['"]/,
	/\bcreatePinia\b/,
	/from\s+['"]pinia['"]/,
]

for (const file of files) {
	const markdown = readFileSync(file, 'utf8')
	for (const match of markdown.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
		const language = match[1].trim().split(/\s+/)[0]
		if (language === 'diff') continue
		const code = match[2]
		const pattern = legacyPatterns.find(candidate => candidate.test(code))
		if (pattern) {
			failures.push(
				`${relative(root, file)}:${lineAt(markdown, match.index)} contains an active legacy setup snippet`,
			)
		}
	}
}

if (failures.length > 0) {
	throw new Error(`Stale documentation setup:\n${failures.join('\n')}`)
}

console.log(`checked active setup snippets in ${files.length} Markdown files`)

function markdownFiles(directory) {
	return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) return markdownFiles(path)
		return extname(path) === '.md' ? [path] : []
	})
}

function lineAt(text, index) {
	return text.slice(0, index).split('\n').length
}
