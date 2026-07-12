// @vitest-environment jsdom

import type {MenuItem} from '@tweeq/core'
import {
	type HarnessEvent,
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
	const app = createApp(
		defineComponent(() => () => {
			const items: MenuItem[] = props.items.map(item =>
				item.kind === 'separator'
					? {separator: true}
					: {
							label: item.label,
							shortLabel: item.shortLabel,
							perform: () =>
								captured.push({name: 'perform', payload: [item.label]}),
						}
			)
			return h(Menu, {
				items,
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
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
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
