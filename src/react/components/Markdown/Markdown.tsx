import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItDeflist from 'markdown-it-deflist'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItTOC, {type TocOptions} from 'markdown-it-toc-done-right'
import {type HTMLAttributes, useMemo} from 'react'

import {classNames} from '../../classNames'
import styles from './Markdown.module.styl'

export interface MarkdownProps extends HTMLAttributes<HTMLDivElement> {
	source?: string
	anchor?: MarkdownItAnchor.AnchorOptions
	breaks?: boolean
	html?: boolean
	langPrefix?: string
	linkify?: boolean
	toc?: Partial<TocOptions>
}

export function Markdown({
	source = '',
	anchor = {},
	breaks = false,
	html = false,
	langPrefix = 'language-',
	linkify = false,
	toc = {},
	className,
	...props
}: MarkdownProps) {
	const rendered = useMemo(
		() =>
			new MarkdownIt()
				.use(MarkdownItAnchor, anchor)
				.use(MarkdownItDeflist)
				.use(MarkdownItFootnote)
				.use(MarkdownItTOC, toc as TocOptions)
				.set({breaks, html, langPrefix, linkify})
				.render(source),
		[anchor, breaks, html, langPrefix, linkify, source, toc]
	)

	return (
		<div
			{...props}
			className={classNames(styles.markdown, className)}
			dangerouslySetInnerHTML={{__html: rendered}}
		/>
	)
}
