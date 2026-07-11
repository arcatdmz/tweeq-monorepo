import {addAnchorName} from './util'

export const TOOLTIP_ANCHOR_NAME = '--tq-tooltip'

export interface TooltipContent {
	content: string
	html: boolean
	title: string
	description: string
}

export interface TooltipSnapshot extends TooltipContent {
	reference: HTMLElement | null
	open: boolean
}

let snapshot: TooltipSnapshot = {
	reference: null,
	content: '',
	html: false,
	title: '',
	description: '',
	open: false,
}
const listeners = new Set<() => void>()

function update(next: Partial<TooltipSnapshot>): void {
	snapshot = {...snapshot, ...next}
	listeners.forEach(listener => listener())
}

export function getTooltipSnapshot(): TooltipSnapshot {
	return snapshot
}

export function subscribeTooltip(listener: () => void): () => void {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

let anchoredElement: HTMLElement | null = null
let removeAnchorName: (() => void) | null = null

export function setTooltipAnchor(element: HTMLElement): void {
	if (anchoredElement === element) return
	removeAnchorName?.()
	removeAnchorName = addAnchorName(element, TOOLTIP_ANCHOR_NAME)
	anchoredElement = element
}

export function clearTooltipAnchor(element: HTMLElement): void {
	if (anchoredElement !== element) return
	removeAnchorName?.()
	removeAnchorName = null
	anchoredElement = null
}

let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

export function showTooltip(
	reference: HTMLElement,
	content: TooltipContent,
	showDelay = 200
): void {
	clearTimeout(hideTimer)
	clearTimeout(showTimer)

	const apply = () => update({reference, ...content, open: true})
	if (snapshot.open) apply()
	else showTimer = setTimeout(apply, showDelay)
}

export function hideTooltip(reference: HTMLElement, hideDelay = 0): void {
	clearTimeout(showTimer)
	clearTimeout(hideTimer)
	hideTimer = setTimeout(() => {
		if (snapshot.reference === reference) update({open: false})
	}, hideDelay)
}

export function updateTooltip(
	reference: HTMLElement,
	content: TooltipContent
): void {
	if (snapshot.open && snapshot.reference === reference) update(content)
}

export function closeTooltip(reference: HTMLElement): void {
	clearTimeout(showTimer)
	if (snapshot.reference !== reference) return
	clearTimeout(hideTimer)
	update({open: false})
}

export function setTooltipOpen(open: boolean): void {
	if (snapshot.open !== open) update({open})
}
