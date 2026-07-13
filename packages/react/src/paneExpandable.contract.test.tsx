// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PaneExpandableContractProps,
	type RendererHarness,
	runPaneExpandableContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {PaneExpandable} from './components/PaneExpandable'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runPaneExpandableContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<PaneExpandable
					icon="material-symbols:tune"
					persistent
					{...(props.controlled ? {open: props.open} : {})}
					onChangeOpen={open =>
						captured.push({name: 'change', payload: [open]})
					}
				/>
			)
		})
	}
	await render()

	const harness: RendererHarness<PaneExpandableContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
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
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
