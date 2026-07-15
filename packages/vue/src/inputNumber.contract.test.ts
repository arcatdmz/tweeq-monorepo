// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputNumberContractProps,
	type KeyAction,
	type RendererHarness,
	runInputNumberContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputNumber} from './InputNumber'

vi.mock('@iconify/vue', () => ({
	Icon: {render: () => null},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

runInputNumberContract(async (component, initialProps) => {
	if (component !== 'InputNumber') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputNumber, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: number) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputNumberContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const partName = part ?? 'input'
			const initial = harness.part(partName) as HTMLElement | null
			if (!initial) throw new Error(`Missing part: ${partName}`)
			initial.focus()
			await nextTick()
			const target = harness.part(partName)
			if (!target) throw new Error(`Missing part after focus: ${partName}`)
			target.dispatchEvent(new KeyboardEvent(`key${action.type}`, {...action, bubbles: true}))
			await nextTick()
		},
		async activate() {},
		async text(next, part) {
			const target = harness.part(part ?? 'input') as HTMLInputElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
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
