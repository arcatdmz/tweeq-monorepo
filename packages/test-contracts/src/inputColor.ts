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

		it('uses native disabled semantics and stable pad styling hooks', async () => {
			harness = await createHarness('InputColorPad', {
				value: '#ff0000',
				disabled: true,
				invalid: true,
			})
			const root = harness.part('root') as HTMLButtonElement
			expect(root.getAttribute('data-tq-component')).toBe('input-color-pad')
			expect(root.type).toBe('button')
			expect(root.disabled).toBe(true)
			expect(root.getAttribute('aria-invalid')).toBe('true')
			expect(harness.part('swatch')).not.toBeNull()
			await harness.activate('root')
			expect(harness.events()).toEqual([])
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
