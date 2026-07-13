// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputDrumContractProps,
	type KeyAction,
	type PointerAction,
	type RendererHarness,
	runInputDrumContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputDrum} from './InputDrum'

runInputDrumContract(async (component, initialProps) => {
	if (component !== 'InputDrum') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputDrum, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: unknown) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputDrumContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if ('value' in next) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.dispatchEvent(
				new WheelEvent('wheel', {
					bubbles: true,
					cancelable: true,
					deltaY: action.deltaY,
				})
			)
			await nextTick()
		},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.focus()
			target.dispatchEvent(
				new KeyboardEvent(`key${action.type}`, {...action, bubbles: true})
			)
			await nextTick()
		},
		async activate() {},
		value: () => value.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}

	return harness
})
