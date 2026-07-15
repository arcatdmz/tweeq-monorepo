import type {Plugin} from 'vite'
import {parse} from 'yaml'

const DOC_MARKDOWN = /\/docs\/(?:index|features|components|colors|example|presentation|uist2025|user-study|user-study-components|all-components)\.md$/

function camelCase(value: string): string {
	return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function convertTemplate(source: string, id: string): string {
	const fences: string[] = []
	let result = source.replace(/```[\s\S]*?```/g, block => {
		const token = `__TWEEQ_CODE_FENCE_${fences.length}__`
		fences.push(block)
		return token
	})

	let frontmatter = ''
	result = result.replace(/^---\n([\s\S]*?)\n---\n?/, (_match, yaml: string) => {
		if (id.endsWith('/docs/index.md')) {
			frontmatter = `export const frontmatter = ${JSON.stringify(parse(yaml))}\n\n`
		}
		return ''
	})
	result = result.replace(/<ClientOnly>|<\/ClientOnly>/g, '')
	result = result.replace(/\s+v-slot=(['"])\{([^}]+)\}\1/g, ' data-mdx-slot="$2"')
	result = result.replace(/\s+v-bind=(['"])([^'"]+)\1/g, ' {...$2}')
	result = result.replace(
		/\s+:([A-Za-z][\w-]*)(=(['"])([\s\S]*?)\3)/g,
		(_, name: string, _assignment: string, _quote: string, expression: string) =>
			` ${camelCase(name === 'modelValue' ? 'value' : name)}={${expression}}`
	)
	result = result.replace(
		/\s+@([\w:-]+)=(['"])(.*?)\2/g,
		(_, name: string, _quote: string, expression: string) => {
			const reactName = name === 'update:modelValue'
				? 'onChange'
				: `on${camelCase(name).replace(/^./, letter => letter.toUpperCase())}`
			return ` ${reactName}={${expression}}`
		}
	)
	result = result.replace(/\sclass=/g, ' className=')
	result = result.replace(/<img([^>]*?)(?<!\/)\s*>/g, '<img$1 />')
	result = result.replace(
		/style="margin-bottom:\s*0"/g,
		'style={{marginBottom: 0}}'
	)
	result = result.replace(/style="height:\s*30vh"/g, "style={{height: '30vh'}}")
	result = result.replace(
		/<DemoComponent([\s\S]*?)\sdata-mdx-slot="([^"]+)"([\s\S]*?)>([\s\S]*?)<\/DemoComponent>/g,
		(_match, before: string, slot: string, after: string, children: string) =>
			`<DemoComponent${before}${after}>{({${slot}}) => (<>${children}</>)}</DemoComponent>`
	)
	if (id.endsWith('/docs/example.md')) {
		result = result.replace('<ExampleContainer', '<ExampleContainer testId="many-sliders"')
	}

	return frontmatter + result.replace(/__TWEEQ_CODE_FENCE_(\d+)__/g, (_, index: string) => fences[Number(index)])
}

export function reactMarkdownAdapter(): Plugin {
	return {
		name: 'react-markdown-adapter',
		enforce: 'pre',
		transform(source, id) {
			const cleanId = id.split('?')[0]
			if (!DOC_MARKDOWN.test(cleanId)) return null
			return {code: convertTemplate(source, cleanId), map: null}
		},
	}
}
