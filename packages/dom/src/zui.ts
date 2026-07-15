import * as Bndr from 'bndr-js'
import {mat2d, vec2} from 'linearly'

/** Register the shared pan/zoom gesture graph in the current Bndr scope. */
export function bindZuiGestures(
	element: HTMLElement,
	onTransform: (delta: mat2d) => void
): void {
	const pointer = Bndr.pointer(element)
	const keyboard = Bndr.keyboard()
	const leftPressed = pointer.left.pressed({pointerCapture: true})
	const position = pointer.position({coordinate: 'offset'})
	const scroll = pointer.scroll({
		preventDefault: true,
		stopPropagation: true,
		capture: true,
	})
	const altPressed = keyboard.pressed('option')
	const panByDrag = pointer.middle
		.drag({pointerCapture: true})
		.map(data => data.delta)
	const panByScroll = scroll.map(vec2.negate).while(altPressed.not(), false)
	Bndr.combine(panByDrag, panByScroll)
		.map(mat2d.fromTranslation)
		.on(onTransform)

	const zoomByScroll = scroll.while(altPressed, false).map(([, y]) => -y)
	const zoomByPinch = pointer.pinch().map(value => -2 * value)
	const zoomOrigin = position.stash(
		Bndr.combine(
			leftPressed.down(),
			scroll.constant(true as const),
			zoomByPinch.constant(true as const)
		)
	)
	Bndr.combine(zoomByScroll, zoomByPinch)
		.map(delta =>
			mat2d.fromScaling(vec2.of(1.003 ** delta), zoomOrigin.value)
		)
		.on(onTransform)
}
