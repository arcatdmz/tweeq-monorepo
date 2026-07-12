// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputStringContractProps,
	type KeyAction,
	type RendererHarness,
	runInputStringContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputString} from './InputString'

runInputStringContract(async (component, initialProps) => {
	if (component !== 'InputString') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputString, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: string) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputStringContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input')
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			for (const name of names) {
				target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
			}
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
