// @vitest-environment jsdom

import {
	type ParameterGroupContractProps,
	type RendererHarness,
	runParameterGroupContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {ParameterGroup} from './components/ParameterGrid'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

let harnessId = 0
runParameterGroupContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	await act(async () => {
		root.render(
			<ParameterGroup
				{...initialProps}
				name={`contract-parameter-${++harnessId}`}
			/>
		)
	})

	const harness: RendererHarness<ParameterGroupContractProps> = {
		async update() {
			// Iconify schedules one async state pass; keep it inside React's act.
			await act(async () => {
				await new Promise(resolve => setTimeout(resolve, 20))
			})
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key() {},
		async activate(part = 'trigger') {
			await act(async () => (harness.part(part) as HTMLElement | null)?.click())
		},
		value: () =>
			(harness.part('trigger') as HTMLButtonElement).getAttribute(
				'aria-expanded'
			) === 'true',
		events: () => [],
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
