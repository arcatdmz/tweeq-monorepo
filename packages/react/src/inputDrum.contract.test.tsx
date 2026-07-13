// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputDrumContractProps,
	type KeyAction,
	type PointerAction,
	type RendererHarness,
	runInputDrumContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {InputDrum} from './components/InputDrum'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputDrumContract(async (component, initialProps) => {
	if (component !== 'InputDrum') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputDrum
					{...props}
					value={value}
					onChange={next => {
						value = next
						captured.push({name: 'change', payload: [next]})
					}}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputDrumContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if ('value' in next) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () =>
				target.dispatchEvent(
					new WheelEvent('wheel', {
						bubbles: true,
						cancelable: true,
						deltaY: action.deltaY,
					})
				)
			)
			await render()
		},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () => target.focus())
			await act(async () =>
				target.dispatchEvent(
					new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
				)
			)
			await render()
		},
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
