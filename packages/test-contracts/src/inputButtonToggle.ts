import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputButtonToggleContractProps {
	value: boolean
	disabled?: boolean
	invalid?: boolean
	label?: string
}

/** Run the public InputButtonToggle contract against one renderer. */
export function runInputButtonToggleContract(
	createHarness: RendererHarnessFactory<InputButtonToggleContractProps>
) {
	describe('InputButtonToggle renderer contract', () => {
		let harness: RendererHarness<InputButtonToggleContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders and follows controlled value updates', async () => {
			harness = await createHarness('InputButtonToggle', {value: false})
			const root = harness.part('root') as HTMLButtonElement

			expect(harness.value()).toBe(false)
			expect(root.getAttribute('aria-pressed')).toBe('false')

			await harness.update({value: true})

			expect(harness.value()).toBe(true)
			expect(root.getAttribute('aria-pressed')).toBe('true')
		})

		it('activates once and reports the next value', async () => {
			harness = await createHarness('InputButtonToggle', {value: false})

			await harness.activate('root')

			expect(harness.value()).toBe(true)
			expect(harness.events()).toEqual([{name: 'change', payload: [true]}])
		})

		it('uses native disabled behavior', async () => {
			harness = await createHarness('InputButtonToggle', {
				value: false,
				disabled: true,
			})
			const root = harness.part('root') as HTMLButtonElement

			expect(root.disabled).toBe(true)
			await harness.activate('root')
			expect(harness.events()).toEqual([])
		})

		it('exposes stable parts and invalid state', async () => {
			harness = await createHarness('InputButtonToggle', {
				value: false,
				invalid: true,
				label: 'Snap',
			})

			expect(harness.part('root')?.getAttribute('aria-invalid')).toBe('true')
			expect(harness.part('label')?.textContent).toBe('Snap')
		})
	})
}
