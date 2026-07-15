import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItDeflist from 'markdown-it-deflist'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItTOC from 'markdown-it-toc-done-right'

export interface MarkdownRenderOptions {
	anchor?: Record<string, unknown>
	breaks?: boolean
	html?: boolean
	langPrefix?: string
	linkify?: boolean
	toc?: Record<string, unknown>
}

export function renderMarkdown(
	source = '',
	{
		anchor = {},
		breaks = false,
		html = false,
		langPrefix = 'language-',
		linkify = false,
		toc = {},
	}: MarkdownRenderOptions = {}
): string {
	return new MarkdownIt()
		.use(MarkdownItAnchor, anchor as MarkdownItAnchor.AnchorOptions)
		.use(MarkdownItDeflist)
		.use(MarkdownItFootnote)
		.use(MarkdownItTOC, toc)
		.set({breaks, html, langPrefix, linkify})
		.render(source)
}
