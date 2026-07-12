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
