// @vitest-environment jsdom

import {
	type HarnessEvent,
	type KeyAction,
	type RendererHarness,
	runTabsContract,
	type TabsContractProps,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {Tab, Tabs} from './components/Tabs'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

let harnessId = 0
runTabsContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []
	const name = `contract-tabs-${++harnessId}`

	async function render() {
		await act(async () => {
			root.render(
				<Tabs
					name={name}
					vertical={props.vertical}
					onChanged={tab =>
						captured.push({name: 'change', payload: [tab.id]})
					}
					onClicked={tab =>
						captured.push({name: 'click', payload: [tab.id]})
					}
				>
					{props.tabs.map((tab, index) => (
						<Tab
							key={index}
							id={tab.id}
							name={tab.name}
							isDisabled={tab.disabled}
						/>
					))}
				</Tabs>
			)
		})
	}
	await render()

	const harness: RendererHarness<TabsContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer() {},
		async key(action: KeyAction, part = 'root') {
			const target = harness.part(part)
			if (!target) throw new Error(`Missing part: ${part}`)
			const names =
				action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(
						new KeyboardEvent(name, {...action, bubbles: true})
					)
				}
			})
		},
		async activate(part = 'root') {
			await act(async () => (harness.part(part) as HTMLElement | null)?.click())
		},
		value: () =>
			container
				.querySelector('[role="tabpanel"][aria-hidden="false"]')
				?.getAttribute('data-tab-id'),
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
