// @vitest-environment jsdom

import {
	type PaneZuiContractProps,
	type RendererHarness,
	runPaneZuiContract,
} from '@tweeq/test-contracts'
import type {mat2d} from 'linearly'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {PaneZUI} from './components/PaneZUI'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runPaneZuiContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}

	async function render() {
		await act(async () => {
			root.render(<PaneZUI transform={props.transform as mat2d} />)
		})
	}
	await render()

	const harness: RendererHarness<PaneZuiContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => (harness.part('transform') as HTMLElement).style.transform,
		events: () => [],
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
