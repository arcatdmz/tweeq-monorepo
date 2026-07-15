// @vitest-environment jsdom

import type {MenuItem} from '@tweeq/core'
import {
	type HarnessEvent,
	type KeyAction,
	type MenuContractProps,
	type RendererHarness,
	runMenuContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {Menu} from './Menu'

vi.mock('@iconify/vue', () => ({
	Icon: {render: () => null},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

runMenuContract(async (component, initialProps) => {
	if (component !== 'Menu') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const toItems = (entries = props.items): MenuItem[] =>
		entries.map(item =>
			item.kind === 'separator'
				? {separator: true}
				: item.kind === 'group'
					? {label: item.label, children: toItems(item.children)}
					: {
							label: item.label,
							shortLabel: item.shortLabel,
							disabled: item.disabled,
							perform: () =>
								captured.push({name: 'perform', payload: [item.label]}),
						}
		)
	const app = createApp(
		defineComponent(() => () => {
			return h(Menu, {
				items: toItems(),
				onClose: () => captured.push({name: 'close', payload: []}),
			})
		})
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<MenuContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: name =>
			name === 'focused'
				? document.activeElement
				: container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part = 'focused') {
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
		async activate(part) {
			const target = harness.part(part ?? 'item') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'item'}`)
			target.click()
			await nextTick()
		},
		value: () => undefined,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
