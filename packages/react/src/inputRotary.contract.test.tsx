// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputRotaryContractProps,
	type RendererHarness,
	runInputRotaryContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {InputRotary} from './components/InputRotary'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputRotaryContract(async (component, initialProps) => {
	if (component !== 'InputRotary') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputRotary
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

	const harness: RendererHarness<InputRotaryContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
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
