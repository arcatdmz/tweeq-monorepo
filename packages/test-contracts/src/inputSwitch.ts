import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputSwitchContractProps {
	value: boolean
	disabled?: boolean
	label?: string
}

/** Run the same public InputSwitch behavior contract against one renderer. */
export function runInputSwitchContract(
	createHarness: RendererHarnessFactory<InputSwitchContractProps>
) {
	describe('InputSwitch renderer contract', () => {
		let harness: RendererHarness<InputSwitchContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders and follows controlled value updates', async () => {
			harness = await createHarness('InputSwitch', {
				value: false,
				label: 'Enabled',
			})

			expect(harness.value()).toBe(false)
			expect((harness.part('input') as HTMLInputElement).checked).toBe(false)

			await harness.update({value: true})

			expect(harness.value()).toBe(true)
			expect((harness.part('input') as HTMLInputElement).checked).toBe(true)
		})

		it('toggles from the shared keyboard command and confirms', async () => {
			harness = await createHarness('InputSwitch', {value: false})

			await harness.key({type: 'press', key: ' '}, 'input')

			expect(harness.value()).toBe(true)
			expect(harness.events().map(event => event.name)).toEqual([
				'change',
				'confirm',
			])
		})
	})
}
