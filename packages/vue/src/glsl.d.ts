declare module '*.frag' {
	const value: string
	export default value
}

declare module '*?worker' {
	const WorkerConstructor: {new (): Worker}
	export default WorkerConstructor
}
