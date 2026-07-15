// @vitest-environment jsdom

import {
	type HarnessEvent,
	type RendererHarness,
	type RulerContractProps,
	runRulerContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {Ruler} from './components/Ruler'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runRulerContract(async (component, initialProps) => {
	if (component !== 'Ruler') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<Ruler {...props}>
					<i data-tq-part="content-probe" />
				</Ruler>
			)
		})
	}
	await render()

	const harness: RendererHarness<RulerContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => undefined,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
