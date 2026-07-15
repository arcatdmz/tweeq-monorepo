import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputButtonContractProps {
	disabled?: boolean
	invalid?: boolean
	label?: string
	chevron?: boolean
}

/** Run the public InputButton action contract against one renderer. */
export function runInputButtonContract(
	createHarness: RendererHarnessFactory<InputButtonContractProps>
) {
	describe('InputButton renderer contract', () => {
		let harness: RendererHarness<InputButtonContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('activates exactly once', async () => {
			harness = await createHarness('InputButton', {label: 'Apply'})

			await harness.activate('root')

			expect(harness.events()).toEqual([{name: 'activate', payload: []}])
		})

		it('uses native disabled behavior', async () => {
			harness = await createHarness('InputButton', {
				label: 'Apply',
				disabled: true,
			})
			const root = harness.part('root') as HTMLButtonElement

			expect(root.disabled).toBe(true)
			await harness.activate('root')
			expect(harness.events()).toEqual([])
		})

		it('exposes stable content parts and invalid state', async () => {
			harness = await createHarness('InputButton', {
				label: 'Options',
				chevron: true,
				invalid: true,
			})

			expect(harness.part('root')?.getAttribute('aria-invalid')).toBe('true')
			expect(harness.part('label')?.textContent).toBe('Options')
			expect(harness.part('chevron')).not.toBeNull()
		})
	})
}
