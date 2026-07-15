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
import {act, type ComponentType, createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputButton} from './components/InputButton'
import {InputButtonToggle} from './components/InputButtonToggle'
import {InputCheckbox} from './components/InputCheckbox'
import {InputSwitch} from './components/InputSwitch'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

const createHarness = async (component: string, initialProps: InputSwitchContractProps) => {
	const Component = (component === 'InputSwitch'
		? InputSwitch
		: component === 'InputCheckbox'
			? InputCheckbox
			: component === 'InputButtonToggle'
				? InputButtonToggle
				: null) as ComponentType<Record<string, unknown>> | null
	if (!Component) throw new Error(`Unsupported: ${component}`)

	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let currentValue = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				createElement(Component!, {
					...props,
					value: currentValue,
					onChange(value: boolean) {
						currentValue = value
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
		})
	}

	await render()

	const harness: RendererHarness<InputSwitchContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) currentValue = next.value
			await render()
		},
		part(name) {
			return container.querySelector(`[data-tq-part="${name}"]`)
		},
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			const eventName = action.type === 'down' ? 'pointerdown' : action.type === 'up' ? 'pointerup' : action.type === 'move' ? 'pointermove' : 'wheel'
			await act(async () => {
				target.dispatchEvent(new MouseEvent(eventName, {bubbles: true}))
			})
			await render()
		},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'input')
			if (!target) throw new Error(`Missing part: ${part ?? 'input'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
				}
			})
			await render()
		},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () => target.click())
			await render()
		},
		value: () => currentValue,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
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
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				createElement(InputButton, {
					...props,
					onClick: () => captured.push({name: 'activate', payload: []}),
				})
			)
		})
	}

	await render()

	const harness: RendererHarness<InputButtonContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () => target.click())
		},
		value: () => undefined,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})
