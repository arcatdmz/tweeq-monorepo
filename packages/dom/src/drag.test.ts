import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {createDragHandler, type DragHandlerOptions} from './drag'

/**
 * Minimal stand-in for an HTMLElement: EventTarget + the few DOM methods the
 * drag handler touches. Lets the pointer state machine run under node.
 */
class FakeElement extends EventTarget {
	captured: number[] = []
	released: number[] = []

	getBoundingClientRect() {
		return {top: 0, left: 0, right: 100, bottom: 20, width: 100, height: 20}
	}

	setPointerCapture(pointerId: number) {
		this.captured.push(pointerId)
	}

	releasePointerCapture(pointerId: number) {
		this.released.push(pointerId)
	}
}

function pointerEvent(
	type: string,
	init: Partial<{
		button: number
		isPrimary: boolean
		pointerType: string
		clientX: number
		clientY: number
		pointerId: number
	}> = {}
): Event {
	return Object.assign(new Event(type), {
		button: 0,
		isPrimary: true,
		pointerType: 'mouse',
		clientX: 0,
		clientY: 0,
		pointerId: 1,
		...init,
	})
}

function setup(options: DragHandlerOptions = {}) {
	const el = new FakeElement()
	const callbacks = {
		onClick: vi.fn(),
		onDrag: vi.fn(),
		onDragStart: vi.fn(),
		onDragEnd: vi.fn(),
	}
	const handler = createDragHandler(el as unknown as HTMLElement, {
		...callbacks,
		...options,
	})
	return {el, handler, ...callbacks}
}

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('createDragHandler', () => {
	it('treats press + release without movement as a click', () => {
		const {el, onClick, onDragStart, onDragEnd} = setup()

		el.dispatchEvent(pointerEvent('pointerdown', {clientX: 10, clientY: 10}))
		el.dispatchEvent(pointerEvent('pointerup', {clientX: 10, clientY: 10}))

		expect(onClick).toHaveBeenCalledTimes(1)
		expect(onDragStart).not.toHaveBeenCalled()
		expect(onDragEnd).not.toHaveBeenCalled()
	})

	it('does not start dragging below the mouse threshold (3px)', () => {
		const {el, onClick, onDragStart} = setup()

		el.dispatchEvent(pointerEvent('pointerdown', {clientX: 0, clientY: 0}))
		el.dispatchEvent(pointerEvent('pointermove', {clientX: 2, clientY: 0}))
		el.dispatchEvent(pointerEvent('pointerup', {clientX: 2, clientY: 0}))

		expect(onDragStart).not.toHaveBeenCalled()
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('starts dragging once the pointer moves past the threshold', () => {
		const {el, handler, onClick, onDrag, onDragStart, onDragEnd} = setup()

		el.dispatchEvent(pointerEvent('pointerdown', {clientX: 0, clientY: 0}))
		el.dispatchEvent(pointerEvent('pointermove', {clientX: 4, clientY: 0}))

		expect(onDragStart).toHaveBeenCalledTimes(1)
		expect(onDrag).toHaveBeenCalledTimes(1)
		expect(handler.state.dragging).toBe(true)
		expect(handler.state.xy).toEqual([4, 0])
		expect(handler.state.initial).toEqual([0, 0])
		expect(handler.state.delta).toEqual([4, 0])

		el.dispatchEvent(pointerEvent('pointermove', {clientX: 10, clientY: 2}))
		expect(handler.state.delta).toEqual([6, 2])

		el.dispatchEvent(pointerEvent('pointerup', {clientX: 10, clientY: 2}))
		expect(onDragEnd).toHaveBeenCalledTimes(1)
		expect(onClick).not.toHaveBeenCalled()
		expect(handler.state.dragging).toBe(false)
		expect(handler.state.xy).toEqual([0, 0])
	})

	it('uses a larger threshold (5px) for touch', () => {
		const {el, onDragStart} = setup()

		el.dispatchEvent(
			pointerEvent('pointerdown', {
				pointerType: 'touch',
				clientX: 0,
				clientY: 0,
			})
		)
		el.dispatchEvent(
			pointerEvent('pointermove', {
				pointerType: 'touch',
				clientX: 4,
				clientY: 0,
			})
		)
		expect(onDragStart).not.toHaveBeenCalled()

		el.dispatchEvent(
			pointerEvent('pointermove', {
				pointerType: 'touch',
				clientX: 6,
				clientY: 0,
			})
		)
		expect(onDragStart).toHaveBeenCalledTimes(1)
	})

	it('starts dragging after the press delay without movement', () => {
		const {el, onDragStart} = setup({dragDelaySeconds: 0.5})

		el.dispatchEvent(pointerEvent('pointerdown', {clientX: 5, clientY: 5}))
		expect(onDragStart).not.toHaveBeenCalled()

		vi.advanceTimersByTime(500)
		expect(onDragStart).toHaveBeenCalledTimes(1)
	})

	it('starts immediately when dragDelaySeconds is 0', () => {
		const {el, onDragStart} = setup({dragDelaySeconds: 0})

		el.dispatchEvent(pointerEvent('pointerdown'))
		expect(onDragStart).toHaveBeenCalledTimes(1)
	})

	it('measures the target bounds and derives the origin (center)', () => {
		const {el, handler} = setup()

		el.dispatchEvent(pointerEvent('pointerdown'))
		expect(handler.state.width).toBe(100)
		expect(handler.state.height).toBe(20)
		expect(handler.state.origin).toEqual([50, 10])
	})

	it('captures the pointer on the target and releases it on pointerup', () => {
		const {el} = setup()

		el.dispatchEvent(pointerEvent('pointerdown', {pointerId: 7}))
		expect(el.captured).toEqual([7])

		el.dispatchEvent(pointerEvent('pointerup', {pointerId: 7}))
		expect(el.released).toEqual([7])
	})

	it('ignores presses while disabled (dynamic getter)', () => {
		let disabled = true
		const {el, onClick, onDragStart} = setup({disabled: () => disabled})

		el.dispatchEvent(pointerEvent('pointerdown'))
		el.dispatchEvent(pointerEvent('pointermove', {clientX: 10}))
		el.dispatchEvent(pointerEvent('pointerup'))
		expect(onClick).not.toHaveBeenCalled()
		expect(onDragStart).not.toHaveBeenCalled()

		disabled = false
		el.dispatchEvent(pointerEvent('pointerdown'))
		el.dispatchEvent(pointerEvent('pointerup'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('ignores non-primary buttons, foreign pointer types and shouldDrag opt-outs', () => {
		const {el, onClick} = setup({
			pointerType: ['mouse'],
			shouldDrag: event => (event as PointerEvent).clientX >= 0,
		})

		el.dispatchEvent(pointerEvent('pointerdown', {button: 2}))
		el.dispatchEvent(pointerEvent('pointerup', {button: 2}))
		el.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'touch'}))
		el.dispatchEvent(pointerEvent('pointerup', {pointerType: 'touch'}))
		el.dispatchEvent(pointerEvent('pointerdown', {clientX: -1}))
		el.dispatchEvent(pointerEvent('pointerup', {clientX: -1}))

		expect(onClick).not.toHaveBeenCalled()
		expect(el.captured).toEqual([])
	})

	it('stops listening after dispose', () => {
		const {el, handler, onClick} = setup()

		handler.dispose()
		el.dispatchEvent(pointerEvent('pointerdown'))
		el.dispatchEvent(pointerEvent('pointerup'))

		expect(onClick).not.toHaveBeenCalled()
	})
})
