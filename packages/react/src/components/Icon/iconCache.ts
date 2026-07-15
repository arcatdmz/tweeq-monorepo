import {addIcon, getIcon, iconLoaded, loadIcon} from '@iconify/react'

type IconData = NonNullable<ReturnType<typeof getIcon>>

const KEY = 'tq-icon-cache'

function readCache(): Record<string, IconData> {
	try {
		if (typeof localStorage === 'undefined') return {}
		return JSON.parse(localStorage.getItem(KEY) || '{}')
	} catch {
		return {}
	}
}

const cache: Record<string, IconData> = readCache()

for (const [name, data] of Object.entries(cache)) {
	addIcon(name, data)
}

let writeTimer: ReturnType<typeof setTimeout> | undefined

function persist(): void {
	clearTimeout(writeTimer)
	writeTimer = setTimeout(() => {
		try {
			localStorage.setItem(KEY, JSON.stringify(cache))
		} catch {
			// Best-effort cache: storage can be unavailable or full.
		}
	}, 500)
}

function store(name: string): void {
	if (cache[name]) return
	const data = getIcon(name)
	if (!data) return
	cache[name] = data
	persist()
}

/** Load an Iconify icon and remember its data for the next page load. */
export function rememberIcon(name: string): void {
	if (cache[name]) return
	if (iconLoaded(name)) {
		store(name)
		return
	}

	loadIcon(name)
		.then(() => store(name))
		.catch(() => {
			// Unknown icon name or offline first load.
		})
}
