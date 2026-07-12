import {type RefObject, useEffect, useRef} from 'react'

export function useResizeObserver<T extends Element>(
	target: RefObject<T | null>,
	callback: ResizeObserverCallback,
	options?: ResizeObserverOptions
): void {
	const callbackRef = useRef(callback)
	callbackRef.current = callback
	const record = useRef<
		| {
				element: T
				options: ResizeObserverOptions | undefined
				observer: ResizeObserver
		  }
		| undefined
	>(undefined)

	useEffect(() => {
		const element = target.current
		const current = record.current
		if (current?.element === element && current.options === options) return

		current?.observer.disconnect()
		record.current = undefined
		if (!element || typeof ResizeObserver === 'undefined') return

		const observer = new ResizeObserver((entries, instance) => {
			callbackRef.current(entries, instance)
		})
		observer.observe(element, options)
		record.current = {element, options, observer}
	})

	useEffect(() => {
		return () => {
			record.current?.observer.disconnect()
			record.current = undefined
		}
	}, [])
}
