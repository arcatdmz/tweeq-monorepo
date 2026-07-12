// @vitest-environment jsdom

import {
	type PaneZuiContractProps,
	type RendererHarness,
	runPaneZuiContract,
} from '@tweeq/test-contracts'
import type {mat2d} from 'linearly'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {PaneZUI} from './PaneZUI'

runPaneZuiContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const app = createApp(
		defineComponent(() => () =>
			h(PaneZUI, {transform: props.transform as mat2d})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<PaneZuiContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => (harness.part('transform') as HTMLElement).style.transform,
		events: () => [],
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
