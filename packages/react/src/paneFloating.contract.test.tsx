// @vitest-environment jsdom

import type {FloatingPanePosition} from '@tweeq/core'
import {
	type PaneFloatingContractProps,
	type PointerAction,
	type RendererHarness,
	runPaneFloatingContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {PaneFloating} from './components/PaneFloating'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

let harnessId = 0
runPaneFloatingContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let value: FloatingPanePosition = initialProps.position
	const name = `contract-floating-${++harnessId}`
	await act(async () => {
		root.render(
			<PaneFloating
				name={name}
				position={initialProps.position}
				onChangePosition={next => (value = next)}
			/>
		)
	})

	const harness: RendererHarness<PaneFloatingContractProps> = {
		async update() {},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer(action: PointerAction, part = 'left') {
			installGeometry(harness)
			await act(async () => {
				harness.part(part)?.dispatchEvent(pointerEvent(action))
			})
		},
		async key() {},
		async activate() {},
		value: () => value,
		events: () => [],
		unmount() {
			act(() => root.unmount())
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
