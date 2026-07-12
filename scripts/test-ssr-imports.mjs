#!/usr/bin/env node
/* global console, URL */
/**
 * ADR 0002 smoke test: every JavaScript package entry must be importable by
 * plain Node without DOM globals or bundler-only resolution behavior.
 */
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

const root = resolve(new URL('..', import.meta.url).pathname)
const requireReact = createRequire(resolve(root, 'packages/react/package.json'))
const requireVue = createRequire(resolve(root, 'packages/vue/package.json'))
const {createElement} = requireReact('react')
const {renderToString: renderReactToString} = requireReact('react-dom/server')
const {createSSRApp, h} = requireVue('vue')
const {renderToString: renderVueToString} = requireVue('vue/server-renderer')
const entries = [
	['@tweeq/core', 'packages/core/dist/index.js'],
	['@tweeq/core/validator', 'packages/core/dist/validator.js'],
	['@tweeq/dom', 'packages/dom/dist/index.js'],
	['@tweeq/react', 'packages/react/dist/index.es.js'],
	['@tweeq/vue', 'packages/vue/dist/index.es.js'],
]

const imported = new Map()
for (const [name, entry] of entries) {
	imported.set(name, await import(pathToFileURL(resolve(root, entry)).href))
	console.log(`SSR import OK: ${name}`)
}

const react = imported.get('@tweeq/react')
renderReactToString(
	createElement(react.InputColorPicker, {value: '#336699', pickers: []})
)
console.log('SSR render OK: React InputColorPicker')
const reactMarkdown = renderReactToString(
	createElement(react.Markdown, {source: '# Server title'})
)
if (!reactMarkdown.includes('id="server-title"')) {
	throw new Error('React Markdown omitted synchronous SSR content')
}
console.log('SSR render OK: React Markdown')

const vue = imported.get('@tweeq/vue')
await renderVueToString(
	createSSRApp({
		render: () =>
			h(vue.InputColorPicker, {modelValue: '#336699', pickers: []}),
	})
)
console.log('SSR render OK: Vue InputColorPicker')
const vueMarkdown = await renderVueToString(
	createSSRApp({
		render: () => h(vue.Markdown, {source: '# Server title'}),
	})
)
if (!vueMarkdown.includes('id="server-title"') || vueMarkdown.includes('<entry')) {
	throw new Error('Vue Markdown emitted invalid or empty SSR content')
}
console.log('SSR render OK: Vue Markdown')

const require = createRequire(import.meta.url)
for (const [name, entry] of [
	['@tweeq/react', 'packages/react/dist/index.cjs'],
	['@tweeq/vue', 'packages/vue/dist/index.cjs'],
]) {
	require(resolve(root, entry))
	console.log(`CJS require OK: ${name}`)
}
