declare module '*.md' {
	import type {ComponentType} from 'react'

	const Markdown: ComponentType<{
		components?: Record<string, ComponentType<any>>
	}>
	export const frontmatter: Record<string, any>
	export default Markdown
}
