import {
	clearTooltipAnchor,
	closeTooltip,
	getTooltipSnapshot,
	hideTooltip,
	setTooltipAnchor,
	setTooltipOpen,
	showTooltip,
	subscribeTooltip,
	TOOLTIP_ANCHOR_NAME,
	type TooltipContent,
	updateTooltip,
} from '@tweeq/dom'
import {reactive, shallowRef} from 'vue'

export type {TooltipContent}
export {
	clearTooltipAnchor,
	closeTooltip,
	hideTooltip,
	setTooltipAnchor,
	setTooltipOpen,
	showTooltip,
	TOOLTIP_ANCHOR_NAME,
	updateTooltip,
}

const initial = getTooltipSnapshot()
export const tooltipReference = shallowRef<HTMLElement | null>(initial.reference)
export const tooltipState = reactive({
	content: initial.content,
	html: initial.html,
	title: initial.title,
	description: initial.description,
	open: initial.open,
})

subscribeTooltip(() => {
	const snapshot = getTooltipSnapshot()
	tooltipReference.value = snapshot.reference
	Object.assign(tooltipState, {
		content: snapshot.content,
		html: snapshot.html,
		title: snapshot.title,
		description: snapshot.description,
		open: snapshot.open,
	})
})
