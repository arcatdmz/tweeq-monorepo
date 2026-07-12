declare module 'markdown-it-deflist' {
	const plugin: import('markdown-it').PluginSimple
	export default plugin
}

declare module 'markdown-it-footnote' {
	const plugin: import('markdown-it').PluginSimple
	export default plugin
}

declare module '*.frag' {
	const source: string
	export default source
}
