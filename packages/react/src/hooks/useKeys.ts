import {useMemo, useRef, useState} from 'react'

import {useEventListener} from './useEventListener'

function normalize(key: string): string {
	return key.toLowerCase()
}

/**
 * Track a small requested set of keyboard keys, clearing them on window blur.
 *
 * The returned object's identity changes with React state (so renders react to
 * key changes), but its properties are getters over a ref that the key
 * handlers update synchronously. Callbacks that fire between a key event and
 * the next render (pointermove during a drag, bndr emitters) therefore read
 * fresh values — matching the legacy `useMagicKeys` refs, which updated in the
 * same tick as the DOM event.
 */
export function useKeys<const T extends readonly string[]>(keys: T) {
	const [, setRevision] = useState(0)
	const pressedRef = useRef<ReadonlySet<string>>(new Set())
	const requested = useMemo(() => new Set(keys.map(normalize)), [keys])

	function update(next: ReadonlySet<string>) {
		if (
			next.size === pressedRef.current.size &&
			[...next].every(key => pressedRef.current.has(key))
		) {
			return
		}
		pressedRef.current = next
		setRevision(revision => revision + 1)
	}

	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			const key = normalize(event.key)
			if (!requested.has(key)) return
			update(new Set([...pressedRef.current, key]))
		}
	)
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keyup',
		event => {
			const key = normalize(event.key)
			if (!pressedRef.current.has(key)) return
			const next = new Set(pressedRef.current)
			next.delete(key)
			update(next)
		}
	)
	useEventListener(typeof window === 'undefined' ? null : window, 'blur', () =>
		update(new Set())
	)

	return useMemo(() => {
		const out = {} as {[K in T[number]]: boolean}
		for (const key of keys) {
			Object.defineProperty(out, key, {
				enumerable: true,
				get: () => pressedRef.current.has(normalize(key)),
			})
		}
		return out
		// pressedRef.current is intentionally read through getters; the ref dep
		// only refreshes the object identity so renders re-run on key changes.
	}, [keys, pressedRef.current])
}
