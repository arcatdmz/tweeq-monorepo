declare module '*.frag' {
	const source: string
	export default source
}

declare module '*.module.styl' {
	const classes: Record<string, string>
	export default classes
}

declare module '*.styl'
