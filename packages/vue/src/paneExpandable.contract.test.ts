// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PaneExpandableContractProps,
	type RendererHarness,
	runPaneExpandableContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {PaneExpandable} from './PaneExpandable'

runPaneExpandableContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(PaneExpandable, {
				icon: 'material-symbols:tune',
				persistent: true,
				...(props.controlled ? {open: props.open} : {}),
				'onUpdate:open': (open: boolean) =>
					captured.push({name: 'change', payload: [open]}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<PaneExpandableContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
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
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
