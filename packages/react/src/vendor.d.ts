declare module '*.frag' {
	const source: string
	export default source
}

declare module '*?worker' {
	const WorkerConstructor: {new (): Worker}
	export default WorkerConstructor
}
