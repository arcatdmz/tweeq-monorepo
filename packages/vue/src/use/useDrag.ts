import {
	createDragHandler,
	type DragHandler,
	type DragHandlerOptions,
	type DragState,
	type PointerType,
} from '@tweeq/dom'
import {
	type MaybeRef,
	unrefElement,
	useEventListener,
	useResizeObserver,
} from '@vueuse/core'
import {type Component, computed, reactive, type Ref, toRefs, unref, watch} from 'vue'

interface UseDragOptions {
	disabled?: MaybeRef<boolean>
	lockPointer?: MaybeRef<boolean>
	pointerType?: PointerType[]
	dragDelaySeconds?: number
	shouldDrag?: (event: PointerEvent) => boolean
	onClick?: (state: DragState, event: PointerEvent) => void
	onDrag?: (state: DragState, event: PointerEvent) => void
	onDragStart?: (state: DragState, event: PointerEvent) => void
	onDragEnd?: (state: DragState, event: PointerEvent) => void
}

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

/** Vue ref adapter over the shared framework-neutral drag state machine. */
export function useDrag(
	target: Ref<HTMLElement | SVGElement | Component | null>,
	options: UseDragOptions = {}
) {
	const state = reactive<DragState>({...EMPTY_STATE})
	const targetEl = computed<HTMLElement | SVGElement | null>(
		() =>
			(unrefElement(target.value as any) as HTMLElement | SVGElement | null) ??
			null
	)

	let handler: DragHandler | undefined

	function publish(next = handler?.state) {
		if (next) Object.assign(state, next)
	}

	function publishAfterEvent() {
		queueMicrotask(() => publish())
	}

	function createOptions(): DragHandlerOptions {
		return {
			disabled: () => unref(options.disabled) ?? false,
			lockPointer: () => unref(options.lockPointer) ?? false,
			pointerType: options.pointerType,
			dragDelaySeconds: options.dragDelaySeconds,
			shouldDrag: options.shouldDrag,
			onClick(dragState, event) {
				options.onClick?.(dragState, event)
				publishAfterEvent()
			},
			onDrag(dragState, event) {
				publish(dragState)
				options.onDrag?.(dragState, event)
			},
			onDragStart(dragState, event) {
				publish(dragState)
				options.onDragStart?.(dragState, event)
			},
			onDragEnd(dragState, event) {
				publish(dragState)
				options.onDragEnd?.(dragState, event)
				publishAfterEvent()
			},
		}
	}

	watch(
		targetEl,
		(el, _previous, onCleanup) => {
			handler?.dispose()
			handler = el ? createDragHandler(el, createOptions()) : undefined
			if (handler) {
				const current = handler
				publish(current.state)
				onCleanup(() => current.dispose())
			}
		},
		{immediate: true, flush: 'sync'}
	)

	function measure() {
		handler?.measure()
		publish()
	}

	useResizeObserver(targetEl, measure)
	useEventListener('resize', measure)
	useEventListener('scroll', measure, true)

	return toRefs(state)
}
