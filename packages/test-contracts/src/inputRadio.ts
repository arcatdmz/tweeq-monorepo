import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputRadioContractProps {
	value: unknown
	options: unknown[]
	labels: string[]
}

export function runInputRadioContract(
	createHarness: RendererHarnessFactory<InputRadioContractProps>
) {
	describe('InputRadio renderer contract', () => {
		let harness: RendererHarness<InputRadioContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('exposes a radiogroup and SameValue selection state', async () => {
			harness = await createHarness('InputRadio', {
				value: NaN,
				options: [NaN, 0],
				labels: ['Not a number', 'Zero'],
			})

			expect(harness.part('root')?.getAttribute('role')).toBe('radiogroup')
			expect((harness.part('radio-0') as HTMLInputElement).checked).toBe(true)
			expect(harness.part('label-0')?.hasAttribute('data-tq-active')).toBe(
				true
			)
			expect(harness.part('label-0')?.textContent).toContain('Not a number')
		})

		it('activates an option and emits the input lifecycle', async () => {
			harness = await createHarness('InputRadio', {
				value: 'a',
				options: ['a', 'b'],
				labels: ['Alpha', 'Beta'],
			})

			await harness.key({type: 'down', key: 'Tab'}, 'radio-0')
			await harness.key({type: 'down', key: 'Tab'}, 'radio-1')
			await harness.activate('radio-1')

			expect(harness.value()).toBe('b')
			expect(harness.events()).toContainEqual({name: 'focus', payload: []})
			expect(harness.events()).toContainEqual({name: 'blur', payload: []})
			expect(harness.events()).toContainEqual({name: 'change', payload: ['b']})
			expect(harness.events()).toContainEqual({name: 'confirm', payload: []})
		})

		it('uses unique index-based label associations for object values', async () => {
			const first = {id: 1}
			const second = {id: 2}
			harness = await createHarness('InputRadio', {
				value: first,
				options: [first, second],
				labels: ['First', 'Second'],
			})

			const firstInput = harness.part('radio-0') as HTMLInputElement
			const secondInput = harness.part('radio-1') as HTMLInputElement
			expect(firstInput.id).not.toBe(secondInput.id)
			expect((harness.part('label-0') as HTMLLabelElement).htmlFor).toBe(
				firstInput.id
			)
			expect((harness.part('label-1') as HTMLLabelElement).htmlFor).toBe(
				secondInput.id
			)
		})

		it('follows controlled updates without emitting a user lifecycle', async () => {
			harness = await createHarness('InputRadio', {
				value: 'a',
				options: ['a', 'b'],
				labels: ['Alpha', 'Beta'],
			})

			await harness.update({value: 'b'})
			expect((harness.part('radio-1') as HTMLInputElement).checked).toBe(true)
			expect(harness.events()).toEqual([])
		})
	})
}
