import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputSwitchContractProps {
	value: boolean
	disabled?: boolean
	label?: string
}

interface BooleanInputContractOptions {
	component: 'InputSwitch' | 'InputCheckbox'
	parts: readonly string[]
}

function runBooleanInputContract(
	createHarness: RendererHarnessFactory<InputSwitchContractProps>,
	{component, parts}: BooleanInputContractOptions
) {
	describe(`${component} renderer contract`, () => {
		let harness: RendererHarness<InputSwitchContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders and follows controlled value updates', async () => {
			harness = await createHarness(component, {
				value: false,
				label: 'Enabled',
			})

			expect(harness.value()).toBe(false)
			expect((harness.part('input') as HTMLInputElement).checked).toBe(false)

			await harness.update({value: true})

			expect(harness.value()).toBe(true)
			expect((harness.part('input') as HTMLInputElement).checked).toBe(true)
		})

		it('exposes the shared style parts and accessible label', async () => {
			harness = await createHarness(component, {
				value: false,
				label: 'Enabled',
			})

			for (const part of parts) {
				expect(harness.part(part), `missing ${part} part`).not.toBeNull()
			}

			const input = harness.part('input') as HTMLInputElement
			const label = harness.part('label') as HTMLLabelElement
			expect(label.textContent).toBe('Enabled')
			expect(label.htmlFor).toBe(input.id)
		})

		it('forwards the disabled state to the native control', async () => {
			harness = await createHarness(component, {
				value: false,
				disabled: true,
			})

			expect((harness.part('input') as HTMLInputElement).disabled).toBe(true)
		})

		it('toggles from the shared keyboard command and confirms', async () => {
			harness = await createHarness(component, {value: false})

			await harness.key({type: 'press', key: ' '}, 'input')

			expect(harness.value()).toBe(true)
			expect(harness.events().map(event => event.name)).toEqual([
				'change',
				'confirm',
			])
		})
	})
}

/** Run the same public InputSwitch behavior contract against one renderer. */
export function runInputSwitchContract(
	createHarness: RendererHarnessFactory<InputSwitchContractProps>
) {
	runBooleanInputContract(createHarness, {
		component: 'InputSwitch',
		parts: ['root', 'track', 'input', 'handle', 'label'],
	})
}

/** Run the shared boolean-input contract against InputCheckbox. */
export function runInputCheckboxContract(
	createHarness: RendererHarnessFactory<InputSwitchContractProps>
) {
	runBooleanInputContract(createHarness, {
		component: 'InputCheckbox',
		parts: ['root', 'track', 'input', 'mark', 'label'],
	})
}
