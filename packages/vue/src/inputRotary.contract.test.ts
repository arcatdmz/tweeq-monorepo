// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputRotaryContractProps,
	type RendererHarness,
	runInputRotaryContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputRotary} from './InputRotary'

runInputRotaryContract(async (component, initialProps) => {
	if (component !== 'InputRotary') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputRotary, {
				snap: props.snap,
				angleOffset: props.angleOffset,
				disabled: props.disabled,
				invalid: props.invalid,
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

	const harness: RendererHarness<InputRotaryContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
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
