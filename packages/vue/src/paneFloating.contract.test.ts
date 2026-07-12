// @vitest-environment jsdom

import type {FloatingPanePosition} from '@tweeq/core'
import {
	type PaneFloatingContractProps,
	type PointerAction,
	type RendererHarness,
	runPaneFloatingContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick} from 'vue'

import {PaneFloating} from './PaneFloating'

let harnessId = 0
runPaneFloatingContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	let value: FloatingPanePosition = initialProps.position
	const name = `contract-floating-${++harnessId}`
	const app = createApp(
		defineComponent(() => () =>
			h(PaneFloating, {
				name,
				position: initialProps.position,
				'onUpdate:position': (next: FloatingPanePosition) => (value = next),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<PaneFloatingContractProps> = {
		async update() {},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer(action: PointerAction, part = 'left') {
			installGeometry(harness)
			harness.part(part)?.dispatchEvent(pointerEvent(action))
			await nextTick()
		},
		async key() {},
		async activate() {},
		value: () => value,
		events: () => [],
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})

function installGeometry(harness: RendererHarness) {
	for (const part of ['root', 'left']) {
		const element = harness.part(part) as HTMLElement
		Object.assign(element, {
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				right: 400,
				bottom: 400,
				width: 400,
				height: 400,
			}),
			setPointerCapture: () => undefined,
			releasePointerCapture: () => undefined,
		})
	}
}

function pointerEvent(action: PointerAction) {
	const type = action.type === 'down' ? 'pointerdown' : action.type === 'move' ? 'pointermove' : 'pointerup'
	return Object.assign(new Event(type, {bubbles: true}), {
		button: 0,
		isPrimary: true,
		pointerType: 'mouse',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}
