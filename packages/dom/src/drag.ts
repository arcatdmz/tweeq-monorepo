import {vec2} from 'linearly'

export interface DragState {
	/** Current pointer position (viewport coordinates). */
	xy: vec2
	/** Pointer position at the previous move event. */
	previous: vec2
	/** Pointer position when the press started. */
	initial: vec2
	/** Movement since the previous move event. */
	delta: vec2
	/** Center of the target's bounding box. */
	origin: vec2
	top: number
	right: number
	bottom: number
	left: number
	width: number
	height: number
	dragging: boolean
	pointerLocked: boolean
}

export type PointerType = 'mouse' | 'pen' | 'touch'

/** A value that may be dynamic — pass a getter to re-evaluate per event. */
type MaybeGetter<T> = T | (() => T)

function resolve<T>(value: MaybeGetter<T> | undefined, defaultValue: T): T {
	if (typeof value === 'function') return (value as () => T)()
	return value ?? defaultValue
}

export interface DragHandlerOptions {
	/**
	 * Whether dragging is disabled
	 * @default false
	 */
	disabled?: MaybeGetter<boolean>

	/**
	 * Whether to lock the pointer when dragging
	 * @default false
	 */
	lockPointer?: MaybeGetter<boolean>

	/**
	 * Which pointer types can start dragging
	 * @default ['mouse', 'pen', 'touch']
	 */
	pointerType?: PointerType[]

	/**
	 * The continuous press time until it is regarded as dragging
	 * Set to 0 to start dragging immediately
	 * @default 0.5
	 */
	dragDelaySeconds?: number

	/**
	 * Per-pointerdown gate. When it returns false the press is ignored entirely
	 * (no capture, no click, no drag), so the event falls through to whatever is
	 * underneath — e.g. a focused <input> placing its text caret. Use it to make
	 * only certain regions of the target draggable.
	 * @default () => true
	 */
	shouldDrag?: (event: PointerEvent) => boolean

	onClick?: (state: DragState, event: PointerEvent) => void
	onDrag?: (state: DragState, event: PointerEvent) => void
	onDragStart?: (state: DragState, event: PointerEvent) => void
	onDragEnd?: (state: DragState, event: PointerEvent) => void
}

export interface DragHandler {
	/** Live drag state, mutated in place as events arrive. */
	readonly state: Readonly<DragState>
	/** Re-measure the target's bounding box into the state. */
	measure(): void
	/** Detach every listener and reset pending timers. */
	dispose(): void
}

/**
 * The pointer-drag state machine extracted from the legacy `useDrag`
 * composable: press → (delay or movement threshold) → drag → release, with
 * optional pointer lock and per-press gating. The React `useDrag` hook wraps
 * this and re-creates the handler when the element or options change.
 */
export function createDragHandler(
	target: HTMLElement | SVGElement,
	{
		disabled,
		lockPointer = false,
		pointerType = ['mouse', 'pen', 'touch'],
		dragDelaySeconds = 0.5,
		shouldDrag,
		onClick,
		onDrag,
		onDragStart,
		onDragEnd,
	}: DragHandlerOptions = {}
): DragHandler {
	const state: DragState = {
		// All coordinates are relative to the viewport
		xy: vec2.zero,
		previous: vec2.zero,
		initial: vec2.zero,
		delta: vec2.zero,
		origin: vec2.zero,
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: 0,
		height: 0,
		dragging: false,
		pointerLocked: false,
	}

	let dragDelayTimer: ReturnType<typeof setTimeout> | undefined
	let pointerdown = false

	function measure() {
		const rect = target.getBoundingClientRect()

		state.top = rect.top
		state.right = rect.right
		state.bottom = rect.bottom
		state.left = rect.left
		state.width = rect.width
		state.height = rect.height

		state.origin = vec2.lerp(
			[state.left, state.top],
			[state.right, state.bottom],
			0.5
		)
	}

	function lock() {
		if ('requestPointerLock' in target) {
			try {
				// Chrome returns a promise that can reject (e.g. right after an
				// exit); swallow it like the legacy vueuse wrapper did.
				void Promise.resolve(target.requestPointerLock()).catch(() => {})
			} catch {
				// Older engines throw synchronously instead
			}
			state.pointerLocked = true
		}
	}

	function unlock() {
		target.ownerDocument?.exitPointerLock()
	}

	function fireDragStart(event: PointerEvent) {
		if (resolve(lockPointer, false)) {
			lock()
		}

		state.dragging = true
		state.initial = state.previous
		onDragStart?.(state, event)
	}

	function onPointerDown(event: PointerEvent) {
		// Ignore when disabled
		if (resolve(disabled, false)) return
		// Ignore non-left click
		if (event.button !== 0 || !event.isPrimary) return
		// Ignore non-pointer type
		if (!pointerType.includes(event.pointerType as PointerType)) return
		// Let the press fall through when the region opts out (e.g. a focused
		// input's text area, so the click lands a caret instead of dragging)
		if (shouldDrag && !shouldDrag(event)) return

		pointerdown = true

		// Initialize pointer position
		state.xy = state.previous = state.initial = [event.clientX, event.clientY]
		measure()

		if (dragDelaySeconds === 0) {
			// Start drag immediately
			fireDragStart(event)
		} else {
			dragDelayTimer = setTimeout(
				() => fireDragStart(event),
				dragDelaySeconds * 1000
			)
		}

		// Capture on the (stable) target element, not event.target: a pressed child
		// can re-render or unmount mid-drag (e.g. a grab zone that only exists while
		// the value is at an edge), which would implicitly release capture and let
		// the drag break the moment the pointer leaves the element's box.
		target.setPointerCapture(event.pointerId)
	}

	function onPointerMove(event: PointerEvent) {
		if (!pointerdown) return

		if (event.movementX !== undefined && event.movementY !== undefined) {
			// movement properties ignore the zoom level of the browser,
			// so we need to scale it by the zoom
			const zoomLevel = window.outerWidth / window.innerWidth
			const movement = vec2.scale(
				[event.movementX, event.movementY],
				1 / zoomLevel
			)

			state.xy = vec2.add(state.xy, movement)
		} else {
			state.xy = [event.clientX, event.clientY]
		}

		state.delta = vec2.sub(state.xy, state.previous)
		measure()

		if (vec2.squaredLength(state.delta) === 0) return

		if (!state.dragging) {
			// Determine whether dragging has started. The mouse threshold is a few
			// px, not 1: a 1px threshold reads the incidental jitter of an ordinary
			// click as a drag, which both nudges the value and (for lockPointer
			// inputs like InputColor) flashes pointer lock. tweak and pointer lock
			// both begin here, at this one threshold.
			const d = vec2.dist(state.initial, state.xy)
			const minDragDistance = event.pointerType === 'mouse' ? 3 : 5
			if (d >= minDragDistance) {
				clearTimeout(dragDelayTimer)
				fireDragStart(event)
			}
		}

		if (state.dragging) {
			onDrag?.(state, event)
		}

		state.previous = state.xy
	}

	function onPointerUp(event: PointerEvent) {
		if (state.pointerLocked) {
			unlock()
		}
		state.pointerLocked = false

		if (pointerdown) {
			if (state.dragging) {
				onDragEnd?.(state, event)
			} else {
				onClick?.(state, event)
			}
		}

		// Reset
		clearTimeout(dragDelayTimer)
		pointerdown = false
		state.dragging = false
		state.xy = state.initial = state.delta = vec2.zero
		target.releasePointerCapture(event.pointerId)
	}

	target.addEventListener('pointerdown', onPointerDown as EventListener)
	target.addEventListener('pointermove', onPointerMove as EventListener)
	target.addEventListener('pointerup', onPointerUp as EventListener)
	target.addEventListener('pointercancel', onPointerUp as EventListener)
	target.addEventListener('pointerleave', onPointerUp as EventListener)

	measure()

	return {
		state,
		measure,
		dispose() {
			clearTimeout(dragDelayTimer)
			target.removeEventListener('pointerdown', onPointerDown as EventListener)
			target.removeEventListener('pointermove', onPointerMove as EventListener)
			target.removeEventListener('pointerup', onPointerUp as EventListener)
			target.removeEventListener('pointercancel', onPointerUp as EventListener)
			target.removeEventListener('pointerleave', onPointerUp as EventListener)
		},
	}
}
