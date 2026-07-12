// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputColorContractProps,
	type RendererHarness,
	runInputColorContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputColor, InputColorPicker} from './InputColor'

runInputColorContract(async (component, initialProps) => {
	Object.assign(window, {
		EyeDropper: class {
			async open() {
				return {sRGBHex: '#336699'}
			}
		},
	})
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const Component =
		component === 'InputColor'
			? InputColor
			: component === 'InputColorPicker'
				? InputColorPicker
				: throwUnsupported(component)
	const app = createApp(
		defineComponent(() => () =>
			h(Component, {
				...props,
				modelValue: value.value,
				pickers: [],
				presets: [],
				'onUpdate:modelValue'(next: string) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputColorContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part = 'root') {
			;(harness.part(part) as HTMLElement | null)?.click()
			await Promise.resolve()
			await nextTick()
		},
		value: () => value.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
			delete (window as unknown as {EyeDropper?: unknown}).EyeDropper
		},
	}
	return harness
})

function throwUnsupported(component: string): never {
	throw new Error(`Unsupported: ${component}`)
}
