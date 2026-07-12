// @vitest-environment jsdom

import {
	type ParameterGroupContractProps,
	type RendererHarness,
	runParameterGroupContract,
} from '@tweeq/test-contracts'
import {createApp, h, nextTick} from 'vue'

import {ParameterGroup} from './ParameterGrid'

let harnessId = 0
runParameterGroupContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const name = `contract-parameter-${++harnessId}`
	const app = createApp({
		render: () =>
			h(ParameterGroup, {
				...initialProps,
				name,
			}),
	})
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<ParameterGroupContractProps> = {
		async update() {},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key() {},
		async activate(part = 'trigger') {
			;(harness.part(part) as HTMLElement | null)?.click()
			await nextTick()
		},
		value: () =>
			(harness.part('trigger') as HTMLButtonElement).getAttribute(
				'aria-expanded'
			) === 'true',
		events: () => [],
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
