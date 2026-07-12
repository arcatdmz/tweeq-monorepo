import {
	type ComponentType,
	Fragment,
	type ReactNode,
	useEffect,
	useState,
} from 'react'

import {themeStore} from '../src/core'
import {Viewport} from '../src/react'
import {assetPath} from './assetPath'
import {ColorsPage} from './pages/ColorsPage'
import {ComponentsPage} from './pages/ComponentsPage'
import {ExamplesPage} from './pages/ExamplesPage'
import {FeaturesPage} from './pages/FeaturesPage'
import {HomePage} from './pages/HomePage'
import {PresentationPage} from './pages/PresentationPage'
import {UIST2025Page} from './pages/UIST2025Page'
import {UserStudyComponentsPage} from './pages/UserStudyComponentsPage'
import {UserStudyPage} from './pages/UserStudyPage'

const sectionModules = import.meta.glob<{default: ComponentType}>(
	'./sections/*Section.tsx',
	{eager: true}
)

export const sections: [name: string, Component: ComponentType][] =
	Object.entries(sectionModules)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, mod]) => [
			path.replace('./sections/', '').replace('Section.tsx', ''),
			mod.default,
		])

type Page =
	| 'home'
	| 'features'
	| 'components'
	| 'colors'
	| 'example'
	| 'all-components'
	| 'uist2025'
	| 'user-study'
	| 'user-study-components'
	| 'presentation'

// Original VuePress navbar order (config.ts) + our extra All Components tab.
const pages: {page: Page; label: string}[] = [
	{page: 'home', label: 'Home'},
	{page: 'features', label: 'Features'},
	{page: 'components', label: 'Components'},
	{page: 'colors', label: 'Colors'},
	{page: 'example', label: 'Example'},
	{page: 'all-components', label: 'All Components'},
]

const routePages: Page[] = [
	...pages.map(({page}) => page),
	'uist2025',
	'user-study',
	'user-study-components',
	'presentation',
]

function pageFromHash(): Page {
	const value = window.location.hash.replace(/^#\/?/, '').split('#')[0]
	return routePages.includes(value as Page)
		? (value as Page)
		: 'home'
}

function AllComponentsPage() {
	// Our own page (not part of the original docs): the auto-discovered
	// gallery, wrapped in a tweeq Viewport like any embedding app would.
	return (
		<Viewport appId="react-demo" className="all-components">
			<article className="docs-page" data-testid="components-page">
				<h1>All Components</h1>
				<p>Interactive gallery of every component in the React port.</p>
				{sections.length === 0 && (
					<p data-testid="placeholder">
						No components ported yet — sections appear here per batch.
					</p>
				)}
				{sections.map(([name, Section]) => (
					<Section key={name} />
				))}
			</article>
		</Viewport>
	)
}

interface SidebarHeading {
	id: string
	text: string
	level: number
	children: SidebarHeading[]
}

function collectHeadings(root: HTMLElement): SidebarHeading[] {
	const flat = [
		...root.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'),
	].map(heading => ({
		id: heading.id,
		text: heading.textContent ?? '',
		level: heading.tagName === 'H2' ? 2 : 3,
		children: [] as SidebarHeading[],
	}))
	const tree: SidebarHeading[] = []
	for (const heading of flat) {
		if (heading.level === 3 && tree.length > 0) {
			tree[tree.length - 1].children.push(heading)
		} else {
			tree.push(heading)
		}
	}
	return tree
}

function SidebarItems({
	root,
	page,
	title,
}: {
	root: HTMLElement | null
	page: Page
	title: string
}) {
	// Collected in an effect keyed on the page: the root <main> keeps its
	// identity across navigation, so a memo on [root] would go stale.
	const [headings, setHeadings] = useState<SidebarHeading[]>([])
	const [active, setActive] = useState('')
	useEffect(() => {
		setHeadings(root ? collectHeadings(root) : [])
	}, [root, page])
	useEffect(() => {
		const all = headings.flatMap(h => [h, ...h.children])
		if (!all.length) return
		setActive(all[0].id)
		const observer = new IntersectionObserver(
			entries => {
				const visible = entries
					.filter(entry => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible[0]) setActive(visible[0].target.id)
			},
			{rootMargin: '-72px 0px -65% 0px'}
		)
		for (const heading of all) {
			const el = document.getElementById(heading.id)
			if (el) observer.observe(el)
		}
		return () => observer.disconnect()
	}, [headings])

	if (!headings.length) return null

	const link = (heading: SidebarHeading) => (
		<a
			className={
				'route-link auto-link vp-sidebar-item' +
				(active === heading.id ? ' route-link-active' : '')
			}
			aria-current={active === heading.id ? 'location' : undefined}
			href={`#/${page}#${heading.id}`}
			aria-label={heading.text}
			onClick={event => {
				event.preventDefault()
				history.replaceState(null, '', `#/${page}#${heading.id}`)
				document
					.getElementById(heading.id)
					?.scrollIntoView({behavior: 'smooth'})
				setActive(heading.id)
			}}
		>
			{heading.text}
		</a>
	)

	return (
		<ul className="vp-sidebar-items">
			<li>
				<p tabIndex={0} className="vp-sidebar-item vp-sidebar-heading">
					{title}
				</p>
				<ul className="vp-sidebar-children">
					{headings.map(heading => (
						<li key={heading.id}>
							{link(heading)}
							{heading.children.length > 0 && (
								<ul className="vp-sidebar-children">
									{heading.children.map(child => (
										<li key={child.id}>{link(child)}</li>
									))}
								</ul>
							)}
						</li>
					))}
				</ul>
			</li>
		</ul>
	)
}

function NavbarItems({page}: {page: Page}) {
	return (
		<nav className="vp-navbar-items vp-hide-mobile" aria-label="site navigation">
			{pages.map(item => (
				<div className="vp-navbar-item" key={item.page}>
					<a
						className={
							'route-link auto-link' +
							(page === item.page ? ' route-link-active' : '')
						}
						href={`#/${item.page}`}
						aria-label={item.label}
					>
						{item.label}
					</a>
				</div>
			))}
			<div className="vp-navbar-item">
				<a
					className="auto-link external-link"
					href="https://github.com/baku89/tweeq"
					aria-label="GitHub"
					rel="noopener noreferrer"
					target="_blank"
				>
					GitHub
				</a>
			</div>
		</nav>
	)
}

function ColorModeToggle() {
	const [mode, setMode] = useState(themeStore.getState().colorMode)
	useEffect(() => themeStore.subscribe(state => setMode(state.colorMode)), [])
	// Mirror VuePress: <html data-theme="..."> drives the vendored stylesheet.
	useEffect(() => {
		document.documentElement.dataset.theme = mode
	}, [mode])
	return (
		<button
			type="button"
			className="vp-toggle-color-mode-button"
			title="toggle color mode"
			onClick={() =>
				themeStore
					.getState()
					.setColorMode(mode === 'light' ? 'dark' : 'light')
			}
		>
			<svg
				className="light-icon"
				viewBox="0 0 32 32"
				style={{display: mode === 'light' ? undefined : 'none'}}
			>
				<path
					d="M16 12.005a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6z"
					fill="currentColor"
				/>
				<path d="M5.394 6.813l1.414-1.415l3.506 3.506L8.9 10.318z" fill="currentColor" />
				<path d="M2 15.005h5v2H2z" fill="currentColor" />
				<path d="M5.394 25.197L8.9 21.691l1.414 1.415l-3.506 3.505z" fill="currentColor" />
				<path d="M15 25.005h2v5h-2z" fill="currentColor" />
				<path d="M21.687 23.106l1.414-1.415l3.506 3.506l-1.414 1.414z" fill="currentColor" />
				<path d="M25 15.005h5v2h-5z" fill="currentColor" />
				<path d="M21.687 8.904l3.506-3.506l1.414 1.415l-3.506 3.505z" fill="currentColor" />
				<path d="M15 2.005h2v5h-2z" fill="currentColor" />
			</svg>
			<svg
				className="dark-icon"
				viewBox="0 0 32 32"
				style={{display: mode === 'dark' ? undefined : 'none'}}
			>
				<path
					d="M13.502 5.414a15.075 15.075 0 0 0 11.594 18.194a11.113 11.113 0 0 1-7.975 3.39c-.138 0-.278.005-.418 0a11.094 11.094 0 0 1-3.2-21.584M14.98 3a1.002 1.002 0 0 0-.175.016a13.096 13.096 0 0 0 1.825 25.981c.164.006.328 0 .49 0a13.072 13.072 0 0 0 10.703-5.555a1.01 1.01 0 0 0-.783-1.565A13.08 13.08 0 0 1 15.89 4.38A1.015 1.015 0 0 0 14.98 3z"
					fill="currentColor"
				/>
			</svg>
		</button>
	)
}

const pageTitles: Record<Page, string> = {
	home: 'Home',
	features: 'Features',
	components: 'Components',
	colors: 'Colors',
	example: 'Examples',
	'all-components': 'All Components',
	uist2025: 'UIST 2025',
	'user-study': 'User Study',
	'user-study-components': 'User Study Components',
	presentation: 'UIST 2025 Presentation',
}

export function DemoApp(): ReactNode {
	const [page, setPage] = useState<Page>(pageFromHash)
	const [content, setContent] = useState<HTMLElement | null>(null)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	useEffect(() => {
		const update = () => {
			setPage(pageFromHash())
			setSidebarOpen(false)
		}
		window.addEventListener('hashchange', update)
		return () => window.removeEventListener('hashchange', update)
	}, [])

	const isHome = page === 'home'
	const hasSidebar = !['home', 'uist2025', 'user-study', 'user-study-components', 'presentation'].includes(page)

	return (
		<div
			className={
				'vp-theme-container external-link-icon' +
				(!hasSidebar ? ' no-sidebar' : '') +
				(sidebarOpen ? ' sidebar-open' : '')
			}
		>
			<header className="vp-navbar" {...{'vp-navbar': ''}}>
				<div
					className="vp-toggle-sidebar-button"
					title="toggle sidebar"
					role="button"
					tabIndex={0}
					aria-expanded={sidebarOpen}
					onClick={() => setSidebarOpen(open => !open)}
				>
					<div className="icon" aria-hidden="true">
						<span />
						<span />
						<span />
					</div>
				</div>
				<span>
					<a className="route-link" href="#/home">
						<img
							className="vp-site-logo"
							src={assetPath('logo.svg')}
							alt="Tweeq"
						/>
						<span className="vp-site-name vp-hide-mobile" aria-hidden="true">
							Tweeq
						</span>
					</a>
				</span>
				<div className="vp-navbar-items-wrapper">
					<NavbarItems page={page} />
					<ColorModeToggle />
				</div>
			</header>
			<div className="vp-sidebar-mask" onClick={() => setSidebarOpen(false)} />
			<aside className="vp-sidebar" {...{'vp-sidebar': ''}}>
				<nav className="vp-navbar-items" aria-label="site navigation">
					{pages.map(item => (
						<div className="vp-navbar-item" key={item.page}>
							<a
								className={
									'route-link auto-link' +
									(page === item.page ? ' route-link-active' : '')
								}
								href={`#/${item.page}`}
								aria-label={item.label}
							>
								{item.label}
							</a>
						</div>
					))}
				</nav>
				<SidebarItems root={content} page={page} title={pageTitles[page]} />
			</aside>
			{isHome ? (
				<main className="vp-home" ref={setContent}>
					<HomePage />
				</main>
			) : (
				<main className="vp-page" ref={setContent}>
					<Fragment key={page}>
						{page === 'features' && <FeaturesPage />}
						{page === 'components' && <ComponentsPage />}
						{page === 'colors' && <ColorsPage />}
						{page === 'example' && <ExamplesPage />}
						{page === 'all-components' && <AllComponentsPage />}
						{page === 'uist2025' && <UIST2025Page />}
						{page === 'user-study' && <UserStudyPage />}
						{page === 'user-study-components' && <UserStudyComponentsPage />}
						{page === 'presentation' && <PresentationPage />}
					</Fragment>
				</main>
			)}
		</div>
	)
}
