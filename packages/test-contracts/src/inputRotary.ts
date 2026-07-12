import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputRotaryContractProps {
	value: number
	snap?: number
	angleOffset?: number
	disabled?: boolean
	invalid?: boolean
}

export function runInputRotaryContract(
	createHarness: RendererHarnessFactory<InputRotaryContractProps>
) {
	describe('InputRotary renderer contract', () => {
		let harness: RendererHarness<InputRotaryContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders controlled values with the configured angle offset', async () => {
			harness = await createHarness('InputRotary', {
				value: 90,
				angleOffset: -90,
			})
			expect((harness.part('indicator') as SVGElement).style.transform).toBe(
				'rotate(0deg)'
			)

			await harness.update({value: 180})
			expect((harness.part('indicator') as SVGElement).style.transform).toBe(
				'rotate(90deg)'
			)
		})

		it('uses native button semantics and stable parts', async () => {
			harness = await createHarness('InputRotary', {
				value: 0,
				disabled: true,
				invalid: true,
			})
			const root = harness.part('root') as HTMLButtonElement
			expect(root.type).toBe('button')
			expect(root.disabled).toBe(true)
			expect(root.getAttribute('aria-invalid')).toBe('true')
			expect(harness.part('rotary')).not.toBeNull()
			expect(harness.events()).toEqual([])
		})

		it('reacts to controlled angle-offset changes', async () => {
			harness = await createHarness('InputRotary', {
				value: 45,
				angleOffset: 0,
			})
			await harness.update({angleOffset: 15})
			expect((harness.part('indicator') as SVGElement).style.transform).toBe(
				'rotate(60deg)'
			)
		})
	})
}
