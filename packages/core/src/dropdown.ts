export function getDropdownTop({
	triggerTop,
	selectedIndex,
	itemHeight,
	listHeight,
	viewportHeight,
	viewportMargin = 6,
	selectChrome = 2,
}: {
	triggerTop: number
	selectedIndex: number
	itemHeight: number
	listHeight: number
	viewportHeight: number
	viewportMargin?: number
	selectChrome?: number
}): number {
	const index = Math.max(0, selectedIndex)
	const idealTop = triggerTop - 2 - selectChrome - index * itemHeight
	const available = viewportHeight - viewportMargin * 2
	const maxTop =
		listHeight <= available
			? viewportHeight - viewportMargin - listHeight
			: viewportHeight - viewportMargin - itemHeight
	return Math.max(
		viewportMargin,
		Math.min(Math.max(viewportMargin, maxTop), idealTop)
	)
}
