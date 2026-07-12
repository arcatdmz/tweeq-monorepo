// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputSwitchContractProps,
	type KeyAction,
	type PointerAction,
	type RendererHarness,
	runInputSwitchContract,
} from '@tweeq/test-contracts'
import {act, createElement} from 'react'
import {createRoot} from 'react-dom/client'

import {InputSwitch} from './components/InputSwitch'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputSwitchContract(async (component, initialProps) => {
	if (component !== 'InputSwitch') throw new Error(`Unsupported: ${component}`)

	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let currentValue = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				createElement(InputSwitch, {
					...props,
					value: currentValue,
					onChange(value) {
						currentValue = value
						captured.push({name: 'change', payload: [value]})
					},
					onConfirm() {
						captured.push({name: 'confirm', payload: []})
					},
				})
			)
		})
	}

	await render()

	const harness: RendererHarness<InputSwitchContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) currentValue = next.value
			await render()
		},
		part(name) {
			return container.querySelector(`[data-tq-part="${name}"]`)
		},
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			const eventName = action.type === 'down' ? 'pointerdown' : action.type === 'up' ? 'pointerup' : action.type === 'move' ? 'pointermove' : 'wheel'
			await act(async () => {
				target.dispatchEvent(new MouseEvent(eventName, {bubbles: true}))
			})
			await render()
		},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input')
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
				}
			})
			await render()
		},
		value: () => currentValue,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})
