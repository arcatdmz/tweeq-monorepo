// @vitest-environment jsdom

import {
	type HarnessEvent,
	type RendererHarness,
	runTabsContract,
	type TabsContractProps,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {Tab, Tabs} from './Tabs'

let harnessId = 0
runTabsContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const name = `contract-tabs-${++harnessId}`
	const app = createApp(
		defineComponent(() => () =>
			h(
				Tabs,
				{
					name,
					onChanged: (tab: {id: string}) =>
						captured.push({name: 'change', payload: [tab.id]}),
					onClicked: (tab: {id: string}) =>
						captured.push({name: 'click', payload: [tab.id]}),
				},
				() =>
					props.tabs.map((tab, index) =>
						h(Tab, {
							key: index,
							id: tab.id,
							name: tab.name,
							isDisabled: tab.disabled,
						})
					)
			)
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<TabsContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key() {},
		async activate(part = 'root') {
			;(harness.part(part) as HTMLElement | null)?.click()
			await nextTick()
		},
		value: () =>
			container
				.querySelector('[role="tabpanel"][aria-hidden="false"]')
				?.getAttribute('data-tab-id'),
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
