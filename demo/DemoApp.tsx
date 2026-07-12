import {type ComponentType, type ReactNode, useEffect, useState} from 'react'

import {themeStore} from '../src/core'
import {ColorsPage} from './pages/ColorsPage'
import {ComponentsPage} from './pages/ComponentsPage'
import {ExamplesPage} from './pages/ExamplesPage'
import {FeaturesPage} from './pages/FeaturesPage'
import {HomePage} from './pages/HomePage'

const sectionModules = import.meta.glob<{default: ComponentType}>(
	'./sections/*Section.tsx',
	{eager: true}
)

export const sections: [name: string, Component: ComponentType][] = Object.entries(sectionModules)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([path, mod]) => [path.replace('./sections/', '').replace('Section.tsx', ''), mod.default])

type Page = 'home' | 'features' | 'components' | 'colors' | 'example' | 'all-components'
const pages: {page: Page; label: string}[] = [
	{page: 'home', label: 'Home'}, {page: 'features', label: 'Features'},
	{page: 'components', label: 'Components'}, {page: 'colors', label: 'Colors'},
	{page: 'example', label: 'Example'}, {page: 'all-components', label: 'All Components'},
]

function pageFromHash(): Page {
	const value = window.location.hash.replace(/^#\/?/, '').split('#')[0]
	return pages.some(({page}) => page === value) ? value as Page : 'all-components'
}

function AllComponentsPage() {
	return <article className="docs-page" data-testid="components-page">
		<h1>All Components</h1>
		<p>Interactive gallery of every component in the React port.</p>
		{sections.length === 0 && <p data-testid="placeholder">No components ported yet — sections appear here per batch.</p>}
		{sections.map(([name, Section]) => <Section key={name} />)}
	</article>
}

function Sidebar({root, page}: {root: HTMLElement | null; page: Page}) {
	// Collected in an effect keyed on the page: the root <main> keeps its
	// identity across navigation, so a memo on [root] goes stale (and during
	// render the DOM still holds the previous page's headings).
	const [headings, setHeadings] = useState<HTMLHeadingElement[]>([])
	const [active, setActive] = useState('')
	useEffect(() => {
		setHeadings(root ? [...root.querySelectorAll<HTMLHeadingElement>('h2[id]')] : [])
	}, [root, page])
	useEffect(() => {
		if (!headings.length) return
		setActive(headings[0].id)
		const observer = new IntersectionObserver(entries => {
			const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
			if (visible[0]) setActive(visible[0].target.id)
		}, {rootMargin: '-72px 0px -65% 0px'})
		headings.forEach(heading => observer.observe(heading))
		return () => observer.disconnect()
	}, [headings])
	if (!headings.length) return null
	return <aside className="docs-sidebar" aria-label="On this page"><ul>{headings.map(heading =>
		<li key={heading.id}><a aria-current={active === heading.id ? 'location' : undefined} href={`#/${pageFromHash()}#${heading.id}`} onClick={event => { event.preventDefault(); history.replaceState(null, '', `#/${pageFromHash()}#${heading.id}`); heading.scrollIntoView({behavior: 'smooth'}); setActive(heading.id) }}>{heading.textContent}</a></li>
	)}</ul></aside>
}

export function DemoApp(): ReactNode {
	const [page, setPage] = useState<Page>(pageFromHash)
	const [content, setContent] = useState<HTMLElement | null>(null)
	const [mode, setMode] = useState(themeStore.getState().colorMode)
	useEffect(() => { const update = () => setPage(pageFromHash()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
	useEffect(() => themeStore.subscribe(state => setMode(state.colorMode)), [])
	return <>
		<header className="demo-header">
			<a className="demo-brand" href="#/home"><img src="/logo.svg" alt="" />Tweeq</a>
			<nav aria-label="Documentation pages">{pages.map(item => <a aria-current={page === item.page ? 'page' : undefined} href={`#/${item.page}`} key={item.page}>{item.label}</a>)}</nav>
			<div className="header-actions"><a className="github-link" href="https://github.com/baku89/tweeq" target="_blank" rel="noreferrer" aria-label="GitHub repository">GitHub</a><button className="color-mode-toggle" type="button" aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} onClick={() => themeStore.getState().setColorMode(mode === 'light' ? 'dark' : 'light')}>{mode === 'light' ? '☾' : '☀'}</button></div>
		</header>
		<div className="docs-layout"><Sidebar root={content} page={page} /><main ref={setContent}>
			{page === 'home' && <HomePage />}{page === 'features' && <FeaturesPage />}{page === 'components' && <ComponentsPage sections={sections} />}{page === 'colors' && <ColorsPage />}{page === 'example' && <ExamplesPage />}{page === 'all-components' && <AllComponentsPage />}
		</main></div>
	</>
}
