// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputSwitchContractProps,
	type KeyAction,
	type PointerAction,
	type RendererHarness,
	runInputSwitchContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputSwitch} from './InputSwitch'

runInputSwitchContract(async (component, initialProps) => {
	if (component !== 'InputSwitch') throw new Error(`Unsupported: ${component}`)

	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const currentValue = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputSwitch, {
				...props,
				modelValue: currentValue.value,
				'onUpdate:modelValue'(value: boolean) {
					currentValue.value = value
					captured.push({name: 'change', payload: [value]})
				},
				onConfirm() {
					captured.push({name: 'confirm', payload: []})
				},
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputSwitchContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) currentValue.value = next.value
			await nextTick()
		},
		part(name) {
			if (name === 'input') return container.querySelector('input')
			if (name === 'track') return container.querySelector('.track')
			return container.firstElementChild
		},
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			const eventName = action.type === 'down' ? 'pointerdown' : action.type === 'up' ? 'pointerup' : action.type === 'move' ? 'pointermove' : 'wheel'
			target.dispatchEvent(new MouseEvent(eventName, {bubbles: true}))
			await nextTick()
		},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input')
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			for (const name of names) {
				target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
			}
			await nextTick()
		},
		value: () => currentValue.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}

	return harness
})
