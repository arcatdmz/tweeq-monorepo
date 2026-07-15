// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputRadioContractProps,
	type KeyAction,
	type RendererHarness,
	runInputRadioContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputRadio} from './InputRadio'

vi.mock('@iconify/vue', () => ({
	Icon: {render: () => null},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

runInputRadioContract(async (component, initialProps) => {
	if (component !== 'InputRadio') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputRadio, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: unknown) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
				onFocus: () => captured.push({name: 'focus', payload: []}),
				onBlur: () => captured.push({name: 'blur', payload: []}),
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputRadioContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if ('value' in next) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'radio-0') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'radio-0'}`)
			target.focus()
			target.dispatchEvent(
				new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
			)
			await nextTick()
		},
		async activate(part) {
			const target = harness.part(part ?? 'radio-0') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'radio-0'}`)
			target.click()
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
