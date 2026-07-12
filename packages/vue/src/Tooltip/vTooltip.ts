import {
	isTooltipContentEmpty,
	parseTooltipContent,
	type TooltipValue,
} from '@tweeq/dom'
import type {Directive} from 'vue'

import {
	clearTooltipAnchor,
	closeTooltip,
	hideTooltip,
	setTooltipAnchor,
	showTooltip,
	updateTooltip,
} from './tooltip'

// `v-tooltip="'text'"`, `v-tooltip="{content, html}"`, or the structured
// `v-tooltip="{title, description}"` (bold title + muted description — use this
// instead of an em-dash "Title — subtext" string).
export type {TooltipValue}

interface Record {
	value: TooltipValue
	enter: () => void
	leave: () => void
}

const records = new WeakMap<HTMLElement, Record>()

export const vTooltip: Directive<HTMLElement, TooltipValue> = {
	mounted(el, binding) {
		const record: Record = {
			value: binding.value,
			enter: () => {
				const content = parseTooltipContent(record.value)
				if (isTooltipContentEmpty(content)) return
				// Register the anchor now, before the show delay, so CSS anchor()
				// is resolved by the time the tooltip appears (no first-frame flash
				// at the viewport corner). It stays put until another element takes
				// over, so the popover remains anchored while it closes.
				setTooltipAnchor(el)
				showTooltip(el, content)
			},
			leave: () => hideTooltip(el),
		}
		el.addEventListener('mouseenter', record.enter)
		el.addEventListener('mouseleave', record.leave)
		el.addEventListener('focus', record.enter)
		el.addEventListener('blur', record.leave)
		records.set(el, record)
	},
	updated(el, binding) {
		const record = records.get(el)
		if (!record) return
		record.value = binding.value
		updateTooltip(el, parseTooltipContent(binding.value))
	},
	unmounted(el) {
		const record = records.get(el)
		if (record) {
			el.removeEventListener('mouseenter', record.enter)
			el.removeEventListener('mouseleave', record.leave)
			el.removeEventListener('focus', record.enter)
			el.removeEventListener('blur', record.leave)
			records.delete(el)
		}
		clearTooltipAnchor(el)
		closeTooltip(el)
	},
}
