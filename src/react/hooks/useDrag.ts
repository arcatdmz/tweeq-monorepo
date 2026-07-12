import {
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import {
	createDragHandler,
	type DragHandler,
	type DragHandlerOptions,
	type DragState,
} from '../../core'
import {useEventListener} from './useEventListener'
import {useResizeObserver} from './useResizeObserver'

export interface UseDragResult extends DragState {
	/** Force a synchronous target measurement and publish the new bounds. */
	measure(): void
}

const EMPTY_OPTIONS: DragHandlerOptions = {}
const EMPTY_STATE: DragState = {
	xy: [0, 0],
	previous: [0, 0],
	initial: [0, 0],
	delta: [0, 0],
	origin: [0, 0],
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	width: 0,
	height: 0,
	dragging: false,
	pointerLocked: false,
}

function sameState(a: DragState, b: DragState): boolean {
	const samePoint = (x: DragState['xy'], y: DragState['xy']) =>
		x[0] === y[0] && x[1] === y[1]

	return (
		samePoint(a.xy, b.xy) &&
		samePoint(a.previous, b.previous) &&
		samePoint(a.initial, b.initial) &&
		samePoint(a.delta, b.delta) &&
		samePoint(a.origin, b.origin) &&
		a.top === b.top &&
		a.right === b.right &&
		a.bottom === b.bottom &&
		a.left === b.left &&
		a.width === b.width &&
		a.height === b.height &&
		a.dragging === b.dragging &&
		a.pointerLocked === b.pointerLocked
	)
}

/** React adapter over the framework-neutral drag state machine. */
export function useDrag<T extends HTMLElement | SVGElement>(
	target: RefObject<T | null>,
	options: DragHandlerOptions = EMPTY_OPTIONS
): UseDragResult {
	const [state, setState] = useState<DragState>(EMPTY_STATE)
	const mounted = useRef(true)
	const record = useRef<
		| {
				element: T
				options: DragHandlerOptions
				handler: DragHandler
		  }
		| undefined
	>(undefined)

	const publish = useCallback((next: Readonly<DragState>) => {
		if (!mounted.current) return
		const snapshot: DragState = {...next}
		setState(current => (sameState(current, snapshot) ? current : snapshot))
	}, [])

	const measure = useCallback(() => {
		const handler = record.current?.handler
		if (!handler) return
		handler.measure()
		publish(handler.state)
	}, [publish])

	// Check after every commit so a ref that starts pointing at a replacement DOM
	// node is noticed even though the ref object itself remains stable.
	useLayoutEffect(() => {
		const element = target.current
		const current = record.current

		if (current?.element === element && current.options === options) return
		current?.handler.dispose()
		record.current = undefined
		if (!element) return

		const publishAfterEvent = () => {
			queueMicrotask(() => {
				const handler = record.current?.handler
				if (handler) publish(handler.state)
			})
		}
		const handler = createDragHandler(element, {
			...options,
			onClick(dragState, event) {
				options.onClick?.(dragState, event)
				publishAfterEvent()
			},
			onDrag(dragState, event) {
				options.onDrag?.(dragState, event)
				publish(dragState)
			},
			onDragStart(dragState, event) {
				options.onDragStart?.(dragState, event)
				publish(dragState)
			},
			onDragEnd(dragState, event) {
				options.onDragEnd?.(dragState, event)
				publishAfterEvent()
			},
		})

		record.current = {element, options, handler}
		publish(handler.state)
	})

	useResizeObserver(target, measure)
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'resize',
		measure
	)
	useEventListener(
		typeof document === 'undefined' ? null : document,
		'scroll',
		measure,
		true
	)

	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
			record.current?.handler.dispose()
			record.current = undefined
		}
	}, [])

	return {...state, measure}
}
