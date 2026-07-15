// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputCubicBezierContractProps,
	type PointerAction,
	type RendererHarness,
	runInputCubicBezierContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {
	InputCubicBezier,
	InputCubicBezierPicker,
} from './components/InputCubicBezier'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputCubicBezierContract(async (component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			const shared = {
				...props,
				value,
				onChange: (next: typeof value) => {
					value = next
					captured.push({name: 'change', payload: [[...next]]})
				},
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			}
			root.render(
				component === 'InputCubicBezier' ? (
					<InputCubicBezier {...shared} />
				) : component === 'InputCubicBezierPicker' ? (
					<InputCubicBezierPicker {...shared} />
				) : (
					throwUnsupported(component)
				)
			)
		})
	}
	await render()

	const harness: RendererHarness<InputCubicBezierContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'pad') as HTMLElement | SVGElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'pad'}`)
			const pad = harness.part('pad') as SVGElement | null
			if (pad) {
				Object.assign(pad, {
					getBoundingClientRect: () => ({
						left: 0,
						top: 0,
						right: 100,
						bottom: 100,
						width: 100,
						height: 100,
					}),
					setPointerCapture: () => undefined,
					releasePointerCapture: () => undefined,
				})
			}
			await act(async () => target.dispatchEvent(pointerEvent(action)))
			await render()
		},
		async key() {},
		async activate() {},
		value: () => value,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})

function pointerEvent(action: PointerAction) {
	const name = action.type === 'down' ? 'pointerdown' : action.type === 'move' ? 'pointermove' : 'pointerup'
	return Object.assign(new Event(name, {bubbles: true}), {
		button: 0,
		isPrimary: true,
		pointerType: 'touch',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}

function throwUnsupported(component: string): never {
	throw new Error(`Unsupported: ${component}`)
}
