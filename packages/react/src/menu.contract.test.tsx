// @vitest-environment jsdom

import type {MenuItem} from '@tweeq/core'
import {
	type HarnessEvent,
	type MenuContractProps,
	type RendererHarness,
	runMenuContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {Menu} from './components/Menu'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runMenuContract(async (component, initialProps) => {
	if (component !== 'Menu') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []

	const toItems = (): MenuItem[] =>
		props.items.map(item =>
			item.kind === 'separator'
				? {separator: true}
				: {
						label: item.label,
						shortLabel: item.shortLabel,
						perform: () =>
							captured.push({name: 'perform', payload: [item.label]}),
					}
		)

	async function render() {
		await act(async () => {
			root.render(
				<Menu
					items={toItems()}
					onClose={() => captured.push({name: 'close', payload: []})}
				/>
			)
		})
	}
	await render()

	const harness: RendererHarness<MenuContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part) {
			const target = harness.part(part ?? 'item') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'item'}`)
			await act(async () => target.click())
		},
		value: () => undefined,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
