import {assetPath} from './assetPath'

export type Page =
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

export const routePages: Page[] = [
	'home',
	'features',
	'components',
	'colors',
	'example',
	'all-components',
	'uist2025',
	'user-study',
	'user-study-components',
	'presentation',
]

export const routeFiles = routePages
	.filter(page => page !== 'home')
	.map(page => `${page}.html`)

export function pageHref(page: Page, anchor?: string): string {
	const file = page === 'home' ? '' : `${page}.html`
	return `${assetPath(file)}${anchor ? `#${anchor}` : ''}`
}

export function vuePageHref(page: Page, anchor?: string): string {
	const file = page === 'home' ? '' : `${page}.html`
	const base = import.meta.env.DEV
		? 'http://127.0.0.1:5177/vue/'
		: assetPath('vue/')
	return `${base}${file}${anchor ? `#${anchor}` : ''}`
}

export function pageFromLocation(location: Location = window.location): Page {
	// Continue accepting old bookmarked hash routes without generating new ones.
	const legacyPage = location.hash.match(/^#\/?([^#]+)/)?.[1]
	if (routePages.includes(legacyPage as Page)) return legacyPage as Page

	const file = location.pathname.split('/').filter(Boolean).at(-1) ?? 'index.html'
	const page = file.replace(/\.html$/, '')
	if (page === 'index') return 'home'
	return routePages.includes(page as Page) ? page as Page : 'home'
}
