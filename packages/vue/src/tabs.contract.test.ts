// @vitest-environment jsdom

import {
	type HarnessEvent,
	type KeyAction,
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
					vertical: props.vertical,
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
		async key(action: KeyAction, part = 'root') {
			const target = harness.part(part)
			if (!target) throw new Error(`Missing part: ${part}`)
			const names =
				action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			for (const name of names) {
				target.dispatchEvent(
					new KeyboardEvent(name, {...action, bubbles: true})
				)
			}
			await nextTick()
		},
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
