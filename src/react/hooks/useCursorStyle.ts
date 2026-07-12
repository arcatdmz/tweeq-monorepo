import {useLayoutEffect, useRef} from 'react'

const cursors = new Map<symbol, string | null>()

function applyCursor(): void {
	if (typeof document === 'undefined') return

	const values = [...cursors.values()]
	const cursor = values.findLast(value => value !== null) ?? 'inherit'
	document.documentElement.style.cursor = cursor
}

/** Register a global cursor override; the most recently mounted override wins. */
export function useCursorStyle(
	cursor: string | null | (() => string | null)
): void {
	const id = useRef(Symbol())
	const value = typeof cursor === 'function' ? cursor() : cursor

	useLayoutEffect(() => {
		cursors.set(id.current, value)
		applyCursor()
	})

	useLayoutEffect(() => {
		return () => {
			cursors.delete(id.current)
			applyCursor()
		}
	}, [])
}
