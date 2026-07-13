// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputRadioContractProps,
	type KeyAction,
	type RendererHarness,
	runInputRadioContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputRadio} from './components/InputRadio'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputRadioContract(async (component, initialProps) => {
	if (component !== 'InputRadio') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputRadio
					{...props}
					value={value}
					onChange={next => {
						value = next
						captured.push({name: 'change', payload: [next]})
					}}
					onFocus={() => captured.push({name: 'focus', payload: []})}
					onBlur={() => captured.push({name: 'blur', payload: []})}
					onConfirm={() => captured.push({name: 'confirm', payload: []})}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputRadioContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if ('value' in next) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'radio-0') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'radio-0'}`)
			await act(async () => target.focus())
			await act(async () =>
				target.dispatchEvent(
					new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
				)
			)
		},
		async activate(part) {
			const target = harness.part(part ?? 'radio-0') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'radio-0'}`)
			await act(async () => target.click())
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
