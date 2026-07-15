// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputStringContractProps,
	type KeyAction,
	type RendererHarness,
	runInputStringContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {InputString} from './components/InputString'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputStringContract(async (component, initialProps) => {
	if (component !== 'InputString') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputString
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

	const harness: RendererHarness<InputStringContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input')
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
				}
			})
		},
		async activate() {},
		async text(next, part) {
			const target = harness.part(part ?? 'input') as HTMLInputElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			await act(async () => {
				const setter = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					'value'
				)?.set
				setter?.call(target, next)
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
