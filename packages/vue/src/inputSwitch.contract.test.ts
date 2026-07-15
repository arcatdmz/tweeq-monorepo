// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputButtonContractProps,
	type InputButtonToggleContractProps,
	type InputSwitchContractProps,
	type KeyAction,
	type PointerAction,
	type RendererHarness,
	runInputButtonContract,
	runInputButtonToggleContract,
	runInputCheckboxContract,
	runInputSwitchContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputButton} from './InputButton'
import {InputButtonToggle} from './InputButtonToggle'
import {InputCheckbox} from './InputCheckbox'
import {InputSwitch} from './InputSwitch'

const createHarness = async (component: string, initialProps: InputSwitchContractProps) => {
	const Component = component === 'InputSwitch'
		? InputSwitch
		: component === 'InputCheckbox'
			? InputCheckbox
			: component === 'InputButtonToggle'
				? InputButtonToggle
				: null
	if (!Component) throw new Error(`Unsupported: ${component}`)

	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const currentValue = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(Component, {
				...props,
				modelValue: currentValue.value,
				'onUpdate:modelValue'(value: boolean) {
					currentValue.value = value
					captured.push({name: 'change', payload: [value]})
				},
				...(component === 'InputButtonToggle'
					? {}
					: {
							onConfirm() {
								captured.push({name: 'confirm', payload: []})
							},
						}),
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
			return container.querySelector(`[data-tq-part="${name}"]`)
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
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.click()
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
}

runInputSwitchContract(createHarness)
runInputCheckboxContract(createHarness)

runInputButtonToggleContract(async (component, initialProps) => {
	if (component !== 'InputButtonToggle') throw new Error(`Unsupported: ${component}`)
	return createHarness(component, initialProps as InputSwitchContractProps) as Promise<RendererHarness<InputButtonToggleContractProps>>
})

runInputButtonContract(async (component, initialProps) => {
	if (component !== 'InputButton') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputButton, {
				...props,
				onClick: () => captured.push({name: 'activate', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputButtonContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
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
