import {
	clearTooltipAnchor,
	closeTooltip,
	hideTooltip,
	isTooltipContentEmpty,
	parseTooltipContent,
	setTooltipAnchor,
	showTooltip,
	type TooltipValue,
	updateTooltip,
} from '@tweeq/dom'
import {type RefObject, useEffect, useMemo, useRef} from 'react'

import {useEventListener} from '../../hooks'

export type {TooltipValue}
export const parseTooltipValue = parseTooltipContent

export function useTooltip<T extends HTMLElement>(
	target: RefObject<T | null>,
	value: TooltipValue
): void {
	const content = useMemo(() => parseTooltipValue(value), [value])
	const contentRef = useRef(content)
	contentRef.current = content
	const elementRef = useRef<T | null>(null)

	const enter = () => {
		const element = target.current
		if (!element || isTooltipContentEmpty(contentRef.current)) return
		setTooltipAnchor(element)
		showTooltip(element, contentRef.current)
	}
	const leave = () => {
		const element = target.current
		if (element) hideTooltip(element)
	}

	useEventListener<MouseEvent>(target, 'mouseenter', enter)
	useEventListener<MouseEvent>(target, 'mouseleave', leave)
	useEventListener<FocusEvent>(target, 'focus', enter)
	useEventListener<FocusEvent>(target, 'blur', leave)

	useEffect(() => {
		const element = target.current
		const previous = elementRef.current
		if (previous && previous !== element) {
			clearTooltipAnchor(previous)
			closeTooltip(previous)
		}
		elementRef.current = element
		if (element) updateTooltip(element, content)
	})

	useEffect(() => {
		return () => {
			const element = elementRef.current
			if (!element) return
			clearTooltipAnchor(element)
			closeTooltip(element)
		}
	}, [])
}
