// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputTimeContractProps,
	type KeyAction,
	type RendererHarness,
	runInputTimeContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputTime} from './InputTime'

vi.mock('@iconify/vue', () => ({
	Icon: {render: () => null},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

runInputTimeContract(async (component, initialProps) => {
	if (component !== 'InputTime') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputTime, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: number) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
				onFocus: () => captured.push({name: 'focus', payload: []}),
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
				onBlur: () => captured.push({name: 'blur', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputTimeContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			target.focus()
			await nextTick()
			target.dispatchEvent(
				new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
			)
			await nextTick()
		},
		async activate() {},
		async text(next, part) {
			const target = harness.part(part ?? 'input') as HTMLInputElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			target.focus()
			await nextTick()
			target.value = next
			target.dispatchEvent(new Event('input', {bubbles: true}))
			await nextTick()
		},
		value: () => value.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}

	return harness
})
