export interface TabSelectionEntry {
	id: string
	isDisabled?: boolean
}

export function normalizeTabId(name: string): string {
	return name.toLowerCase().replaceAll(' ', '-')
}

/** Resolve exactly one selectable tab using persisted/default/document order. */
export function resolveActiveTabId(
	tabs: readonly TabSelectionEntry[],
	currentId?: string | null,
	persistedId?: string | null,
	defaultId?: string | null
): string {
	const selectable = (id?: string | null) =>
		id && tabs.some(tab => tab.id === id && !tab.isDisabled) ? id : undefined
	return (
		selectable(currentId) ??
		selectable(persistedId) ??
		selectable(defaultId) ??
		tabs.find(tab => !tab.isDisabled)?.id ??
		''
	)
}

export function moveTabSelection({
	tabs,
	currentId,
	key,
	vertical,
}: {
	tabs: readonly TabSelectionEntry[]
	currentId: string
	key: string
	vertical: boolean
}): string | undefined {
	const enabled = tabs.filter(tab => !tab.isDisabled)
	if (!enabled.length) return undefined
	if (key === 'Home') return enabled[0].id
	if (key === 'End') return enabled.at(-1)?.id

	const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft'
	const nextKey = vertical ? 'ArrowDown' : 'ArrowRight'
	if (key !== previousKey && key !== nextKey) return undefined
	const currentIndex = enabled.findIndex(tab => tab.id === currentId)
	const start = currentIndex < 0 ? 0 : currentIndex
	const delta = key === previousKey ? -1 : 1
	return enabled[(start + delta + enabled.length) % enabled.length].id
}
