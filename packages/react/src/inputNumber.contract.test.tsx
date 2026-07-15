// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputNumberContractProps,
	type KeyAction,
	type RendererHarness,
	runInputNumberContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputNumber} from './components/InputNumber'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputNumberContract(async (component, initialProps) => {
	if (component !== 'InputNumber') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputNumber
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

	const harness: RendererHarness<InputNumberContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const partName = part ?? 'input'
			const initial = harness.part(partName) as HTMLElement | null
			if (!initial) throw new Error(`Missing part: ${partName}`)
			await act(async () => initial.focus())
			await render()
			const target = harness.part(partName)
			if (!target) throw new Error(`Missing part after focus: ${partName}`)
			await act(async () =>
				target.dispatchEvent(new KeyboardEvent(`key${action.type}`, {...action, bubbles: true}))
			)
			await render()
		},
		async activate() {},
		async text(next, part) {
			const target = harness.part(part ?? 'input') as HTMLInputElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			await act(async () => {
				Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(target, next)
				target.dispatchEvent(new Event('input', {bubbles: true}))
			})
			await render()
		},
		value: () => value,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})
