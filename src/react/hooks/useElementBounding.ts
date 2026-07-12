import {type RefObject, useCallback, useLayoutEffect, useState} from 'react'

import {useEventListener} from './useEventListener'
import {useResizeObserver} from './useResizeObserver'

export interface ElementBounds {
	x: number
	y: number
	top: number
	right: number
	bottom: number
	left: number
	width: number
	height: number
}

export interface ElementBounding extends ElementBounds {
	update(): void
}

const EMPTY_BOUNDS: ElementBounds = {
	x: 0,
	y: 0,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	width: 0,
	height: 0,
}

function sameBounds(a: ElementBounds, b: ElementBounds): boolean {
	return (Object.keys(a) as (keyof ElementBounds)[]).every(
		key => a[key] === b[key]
	)
}

/**
 * Live viewport bounds, refreshed for element resizes, viewport resizes, and
 * capturing scroll events (including scrollable ancestors).
 */
export function useElementBounding<T extends Element>(
	target: RefObject<T | null>
): ElementBounding {
	const [bounds, setBounds] = useState<ElementBounds>(EMPTY_BOUNDS)

	const update = useCallback(() => {
		const rect = target.current?.getBoundingClientRect()
		if (!rect) return

		const next: ElementBounds = {
			x: rect.x,
			y: rect.y,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		}
		setBounds(current => (sameBounds(current, next) ? current : next))
	}, [target])

	useLayoutEffect(update)
	useResizeObserver(target, update)
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'resize',
		update
	)
	useEventListener(
		typeof document === 'undefined' ? null : document,
		'scroll',
		update,
		true
	)

	return {...bounds, update}
}
