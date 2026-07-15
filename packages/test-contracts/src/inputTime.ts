import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputTimeContractProps {
	value: number
	frameRate?: number
	min?: number
	max?: number
	disabled?: boolean
	invalid?: boolean
}

export function runInputTimeContract(
	createHarness: RendererHarnessFactory<InputTimeContractProps>
) {
	describe('InputTime renderer contract', () => {
		let harness: RendererHarness<InputTimeContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('follows controlled frame-value updates', async () => {
			harness = await createHarness('InputTime', {value: 24, frameRate: 24})
			expect((harness.part('input') as HTMLInputElement).value).toBe('24F')

			await harness.update({value: 48})
			expect((harness.part('input') as HTMLInputElement).value).toBe('48F')
		})

		it('uses the shared time expression compiler and bounds', async () => {
			harness = await createHarness('InputTime', {
				value: 24,
				frameRate: 24,
				min: 0,
				max: 50,
			})
			await enterText(harness, '3s')
			expect(harness.value()).toBe(50)
			expect(harness.events()).toContainEqual({name: 'change', payload: [50]})
		})

		it('applies frame-aware keyboard increments', async () => {
			harness = await createHarness('InputTime', {value: 24, frameRate: 24})
			await harness.key({type: 'down', key: 'ArrowUp'}, 'input')
			expect(harness.value()).toBe(48)
			expect(harness.events()).toContainEqual({name: 'confirm', payload: []})
		})

		it('forwards disabled and invalid state', async () => {
			harness = await createHarness('InputTime', {
				value: 0,
				disabled: true,
				invalid: true,
			})
			const input = harness.part('input') as HTMLInputElement
			const root = harness.part('root') as HTMLElement
			expect(root.hasAttribute('data-tq-input-time')).toBe(true)
			expect(harness.part('frame-display')).not.toBeNull()
			expect(input.disabled).toBe(true)
			expect(input.getAttribute('aria-invalid')).toBe('true')
		})

		it('marks invalid expressions without changing the value', async () => {
			harness = await createHarness('InputTime', {value: 24, frameRate: 24})
			await enterText(harness, '(')
			expect(harness.value()).toBe(24)
			expect(harness.part('input')?.getAttribute('aria-invalid')).toBe('true')
		})
	})
}

async function enterText(
	harness: RendererHarness<InputTimeContractProps>,
	value: string
) {
	if (!harness.text) throw new Error('Renderer harness does not support text input')
	await harness.text(value, 'input')
}
