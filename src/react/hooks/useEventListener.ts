import {type RefObject, useEffect, useRef} from 'react'

export type EventTargetSource<T extends EventTarget = EventTarget> =
	| T
	| null
	| undefined
	| RefObject<T | null>

function resolveTarget<T extends EventTarget>(
	target: EventTargetSource<T>
): T | null {
	if (target && 'current' in target) return target.current
	return target ?? null
}

/** A small, ref-aware replacement for vueuse's `useEventListener`. */
export function useEventListener<T extends Event>(
	target: EventTargetSource,
	type: string,
	listener: (event: T) => void,
	options?: AddEventListenerOptions | boolean
): void {
	const listenerRef = useRef(listener)
	listenerRef.current = listener
	const record = useRef<
		| {
				target: EventTarget
				type: string
				options: AddEventListenerOptions | boolean | undefined
				handler: EventListener
		  }
		| undefined
	>(undefined)

	useEffect(() => {
		const currentTarget = resolveTarget(target)
		const current = record.current
		if (
			current?.target === currentTarget &&
			current.type === type &&
			current.options === options
		) {
			return
		}

		if (current) {
			current.target.removeEventListener(
				current.type,
				current.handler,
				current.options
			)
		}
		record.current = undefined
		if (!currentTarget) return

		const handler: EventListener = event => listenerRef.current(event as T)
		currentTarget.addEventListener(type, handler, options)
		record.current = {target: currentTarget, type, options, handler}
	})

	useEffect(() => {
		return () => {
			const current = record.current
			if (!current) return
			current.target.removeEventListener(
				current.type,
				current.handler,
				current.options
			)
			record.current = undefined
		}
	}, [])
}
