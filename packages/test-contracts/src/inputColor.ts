import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputColorContractProps {
	value: string
	disabled?: boolean
	invalid?: boolean
}

export function runInputColorContract(
	createHarness: RendererHarnessFactory<InputColorContractProps>
) {
	describe('InputColor renderer contract', () => {
		let harness: RendererHarness<InputColorContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('exposes a stable outer control', async () => {
			harness = await createHarness('InputColor', {
				value: '#ff0000',
				disabled: true,
				invalid: true,
			})
			expect(harness.part('root')).not.toBeNull()
		})

		it('synchronizes EyeDropper changes and confirms', async () => {
			harness = await createHarness('InputColorPicker', {value: '#ff0000'})
			await harness.activate('eye-dropper')
			expect(harness.value()).toBe('#336699')
			expect(harness.events()).toEqual([
				{name: 'change', payload: ['#336699']},
				{name: 'confirm', payload: []},
			])
		})

		it('disables EyeDropper activation', async () => {
			harness = await createHarness('InputColorPicker', {
				value: '#ff0000',
				disabled: true,
			})
			const button = harness.part('eye-dropper') as HTMLButtonElement
			expect(button.disabled).toBe(true)
			await harness.activate('eye-dropper')
			expect(harness.events()).toEqual([])
		})
	})
}
