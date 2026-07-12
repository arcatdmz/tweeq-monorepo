// @vitest-environment jsdom

import {
	type HarnessEvent,
	type IconIndicatorContractProps,
	type KeyAction,
	type RendererHarness,
	runIconIndicatorContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {IconIndicator} from './IconIndicator'

runIconIndicatorContract(async (component, initialProps) => {
	if (component !== 'IconIndicator') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const active = ref(initialProps.active)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(IconIndicator, {
				...props,
				active: active.value,
				'onUpdate:active'(next: boolean) {
					active.value = next
					captured.push({name: 'change', payload: [next]})
				},
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<IconIndicatorContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.active !== undefined) active.value = next.active
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			for (const name of names) {
				target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
			}
			await nextTick()
		},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.click()
			await nextTick()
		},
		value: () => active.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}

	return harness
})
