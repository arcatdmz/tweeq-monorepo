import {type RefObject, useEffect, useMemo, useRef} from 'react'

import {
	clearTooltipAnchor,
	closeTooltip,
	hideTooltip,
	setTooltipAnchor,
	showTooltip,
	type TooltipContent,
	updateTooltip,
} from '../../../core'
import {useEventListener} from '../../hooks'

export type TooltipValue =
	| string
	| {
			content?: string
			html?: boolean
			title?: string
			description?: string
	  }
	| undefined
	| null

export function parseTooltipValue(value: TooltipValue): TooltipContent {
	if (typeof value === 'string') {
		return {content: value, html: false, title: '', description: ''}
	}
	return {
		content: value?.content ?? '',
		html: value?.html ?? false,
		title: value?.title ?? '',
		description: value?.description ?? '',
	}
}

function isEmpty(content: TooltipContent): boolean {
	return !content.content && !content.title && !content.description
}

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
		if (!element || isEmpty(contentRef.current)) return
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
