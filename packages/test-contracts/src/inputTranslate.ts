import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputTranslateContractProps {
	value: [number, number]
	min?: number | [number, number]
	max?: number | [number, number]
	disabled?: boolean
	invalid?: boolean
	inlinePosition?: 'start' | 'middle' | 'end'
	blockPosition?: 'start' | 'middle' | 'end'
}

export function runInputTranslateContract(
	createHarness: RendererHarnessFactory<InputTranslateContractProps>
) {
	describe('InputTranslate renderer contract', () => {
		let harness: RendererHarness<InputTranslateContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('exposes native button semantics and stable parts', async () => {
			harness = await createHarness('InputTranslate', {
				value: [0, 0],
				disabled: true,
				invalid: true,
				inlinePosition: 'start',
				blockPosition: 'end',
			})
			const root = harness.part('root') as HTMLButtonElement
			expect(root.type).toBe('button')
			expect(root.disabled).toBe(true)
			expect(root.getAttribute('aria-invalid')).toBe('true')
			expect(root.getAttribute('inline-position')).toBe('start')
			expect(root.getAttribute('block-position')).toBe('end')
			expect(harness.part('icon')).not.toBeNull()

			await harness.update({disabled: false, invalid: false})
			expect((harness.part('root') as HTMLButtonElement).disabled).toBe(false)
			expect(harness.part('root')?.hasAttribute('aria-invalid')).toBe(false)
		})

		it('reports a bounded drag and its lifecycle', async () => {
			harness = await createHarness('InputTranslate', {
				value: [1, 2],
				min: [-2, -2],
				max: [5, 5],
			})
			await harness.pointer({type: 'down', x: 0, y: 0})
			expect(harness.part('overlay')).not.toBeNull()
			expect(harness.part('overlay-grid')).not.toBeNull()
			expect(harness.part('zero')).not.toBeNull()
			await harness.pointer({type: 'move', x: 10, y: -10})
			await harness.pointer({type: 'up', x: 10, y: -10})

			expect(harness.value()).toEqual([5, -2])
			expect(harness.events()).toEqual([
				{name: 'focus', payload: []},
				{name: 'change', payload: [[5, -2]]},
				{name: 'confirm', payload: []},
				{name: 'blur', payload: []},
			])
		})

		it('does not start a drag while disabled', async () => {
			harness = await createHarness('InputTranslate', {
				value: [0, 0],
				disabled: true,
			})
			await harness.pointer({type: 'down', x: 0, y: 0})
			await harness.pointer({type: 'move', x: 10, y: 10})
			await harness.pointer({type: 'up', x: 10, y: 10})
			expect(harness.value()).toEqual([0, 0])
			expect(harness.events()).toEqual([])
		})
	})
}
