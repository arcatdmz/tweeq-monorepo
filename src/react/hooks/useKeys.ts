import {useMemo, useState} from 'react'

import {useEventListener} from './useEventListener'

function normalize(key: string): string {
	return key.toLowerCase()
}

/** Track a small requested set of keyboard keys, clearing them on window blur. */
export function useKeys<const T extends readonly string[]>(keys: T) {
	const [pressed, setPressed] = useState<ReadonlySet<string>>(() => new Set())
	const requested = useMemo(() => new Set(keys.map(normalize)), [keys])

	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			const key = normalize(event.key)
			if (!requested.has(key)) return
			setPressed(current => {
				if (current.has(key)) return current
				return new Set([...current, key])
			})
		}
	)
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keyup',
		event => {
			const key = normalize(event.key)
			setPressed(current => {
				if (!current.has(key)) return current
				const next = new Set(current)
				next.delete(key)
				return next
			})
		}
	)
	useEventListener(typeof window === 'undefined' ? null : window, 'blur', () =>
		setPressed(new Set())
	)

	return useMemo(
		() =>
			Object.fromEntries(
				keys.map(key => [key, pressed.has(normalize(key))])
			) as {[K in T[number]]: boolean},
		[keys, pressed]
	)
}
