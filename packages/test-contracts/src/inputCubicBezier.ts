import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputCubicBezierContractProps {
	value: readonly [number, number, number, number]
	disabled?: boolean
	invalid?: boolean
}

export function runInputCubicBezierContract(
	createHarness: RendererHarnessFactory<InputCubicBezierContractProps>
) {
	describe('InputCubicBezier renderer contract', () => {
		let harness: RendererHarness<InputCubicBezierContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders controlled paths and native input state', async () => {
			harness = await createHarness('InputCubicBezier', {
				value: [0.25, 0.1, 0.25, 1],
				disabled: true,
				invalid: true,
			})
			const root = harness.part('root') as HTMLButtonElement
			expect(root.type).toBe('button')
			expect(root.disabled).toBe(true)
			expect(root.getAttribute('aria-invalid')).toBe('true')
			expect(harness.part('path')?.getAttribute('d')).toBe(
				'M 0,0 C 0.25,0.1 0.25,1 1,1'
			)

			await harness.update({value: [0, 0, 1, 1]})
			expect(harness.part('path')?.getAttribute('d')).toBe(
				'M 0,0 C 0,0 1,1 1,1'
			)
		})

		it('updates a handle from pointer input and confirms', async () => {
			harness = await createHarness('InputCubicBezierPicker', {
				value: [0, 0, 1, 1],
			})
			await harness.pointer({type: 'down', x: 0, y: 100}, 'handle-0')
			await harness.pointer({type: 'move', x: 25, y: 75}, 'pad')
			await harness.pointer({type: 'up', x: 25, y: 75}, 'pad')
			expect(harness.value()).toEqual([0.25, 0.25, 1, 1])
			expect(harness.events()).toEqual([
				{name: 'change', payload: [[0.25, 0.25, 1, 1]]},
				{name: 'confirm', payload: []},
			])
		})

		it('blocks picker drag while disabled', async () => {
			harness = await createHarness('InputCubicBezierPicker', {
				value: [0, 0, 1, 1],
				disabled: true,
			})
			await harness.pointer({type: 'down', x: 0, y: 100}, 'handle-0')
			await harness.pointer({type: 'move', x: 25, y: 75}, 'pad')
			await harness.pointer({type: 'up', x: 25, y: 75}, 'pad')
			expect(harness.value()).toEqual([0, 0, 1, 1])
			expect(harness.events()).toEqual([])
		})
	})
}
