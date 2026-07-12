import {createElement, type ReactNode} from 'react'

/**
 * VuePress-style heading with anchor: <hN id><a.header-anchor><span>text.
 * The sidebar tree is derived from these ids (h2/h3).
 */
export function Heading({
	level,
	id,
	children,
}: {
	level: 1 | 2 | 3
	id: string
	children: ReactNode
}) {
	return createElement(
		`h${level}`,
		{id, tabIndex: -1},
		<a className="header-anchor" href={`#${id}`} onClick={e => {
			e.preventDefault()
			document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})
		}}>
			<span>{children}</span>
		</a>
	)
}
