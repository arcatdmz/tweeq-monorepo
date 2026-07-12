import {
	type MarkdownRenderOptions,
	renderMarkdown,
} from '@tweeq/core'
import {type HTMLAttributes, useMemo} from 'react'

import {classNames} from '../../classNames'
import styles from './Markdown.module.styl'

export interface MarkdownProps extends HTMLAttributes<HTMLDivElement> {
	source?: string
	anchor?: MarkdownRenderOptions['anchor']
	breaks?: MarkdownRenderOptions['breaks']
	html?: MarkdownRenderOptions['html']
	langPrefix?: MarkdownRenderOptions['langPrefix']
	linkify?: MarkdownRenderOptions['linkify']
	toc?: MarkdownRenderOptions['toc']
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
			renderMarkdown(source, {anchor, breaks, html, langPrefix, linkify, toc}),
		[anchor, breaks, html, langPrefix, linkify, source, toc]
	)

	return (
		<div
			{...props}
			className={classNames(styles.markdown, className)}
			data-tq-part="root"
			dangerouslySetInnerHTML={{__html: rendered}}
		/>
	)
}
