// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputTimeContractProps,
	type KeyAction,
	type RendererHarness,
	runInputTimeContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputTime} from './components/InputTime'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputTimeContract(async (component, initialProps) => {
	if (component !== 'InputTime') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputTime
					{...props}
					value={value}
					onChange={next => {
						value = next
						captured.push({name: 'change', payload: [next]})
					}}
					onFocus={() => captured.push({name: 'focus', payload: []})}
					onConfirm={() => captured.push({name: 'confirm', payload: []})}
					onBlur={() => captured.push({name: 'blur', payload: []})}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputTimeContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			await act(async () => target.focus())
			await render()
			await act(async () =>
				target.dispatchEvent(
					new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
				)
			)
			await render()
		},
		async activate() {},
		async text(next, part) {
			const target = harness.part(part ?? 'input') as HTMLInputElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			await act(async () => target.focus())
			await render()
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
