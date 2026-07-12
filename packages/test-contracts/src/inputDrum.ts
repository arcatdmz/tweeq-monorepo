import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputDrumContractProps {
	value: string
	options: string[]
	disabled?: boolean
	invalid?: boolean
}

const OPTIONS = ['Auto', '100', '150', '200']

export function runInputDrumContract(
	createHarness: RendererHarnessFactory<InputDrumContractProps>
) {
	describe('InputDrum renderer contract', () => {
		let harness: RendererHarness<InputDrumContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('follows controlled values and exposes stable parts', async () => {
			harness = await createHarness('InputDrum', {
				value: '100',
				options: OPTIONS,
			})
			expect(harness.part('active-cell')?.textContent).toContain('100')
			expect(harness.part('viewport')).not.toBeNull()
			expect(harness.part('track')).not.toBeNull()

			await harness.update({value: '150'})
			expect(harness.part('active-cell')?.textContent).toContain('150')
		})

		it('steps with arrow keys and clamps at the ends', async () => {
			harness = await createHarness('InputDrum', {
				value: '100',
				options: OPTIONS,
			})
			await harness.key({type: 'down', key: 'ArrowRight'}, 'root')
			expect(harness.value()).toBe('150')
			await harness.update({value: '200'})
			await harness.key({type: 'down', key: 'ArrowRight'}, 'root')
			expect(harness.value()).toBe('200')
		})

		it('matches labels with type-ahead', async () => {
			harness = await createHarness('InputDrum', {
				value: 'Auto',
				options: OPTIONS,
			})
			await harness.key({type: 'down', key: '2'}, 'root')
			expect(harness.value()).toBe('200')
		})

		it('consumes multiple wheel steps in one event', async () => {
			harness = await createHarness('InputDrum', {
				value: 'Auto',
				options: OPTIONS,
			})
			await harness.pointer({type: 'wheel', x: 0, y: 0, deltaY: 72}, 'root')
			expect(harness.value()).toBe('200')
		})

		it('forwards disabled and invalid state', async () => {
			harness = await createHarness('InputDrum', {
				value: '100',
				options: OPTIONS,
				disabled: true,
				invalid: true,
			})
			const root = harness.part('root') as HTMLElement
			expect(root.tabIndex).toBe(-1)
			expect(root.getAttribute('aria-invalid')).toBe('true')
			await harness.key({type: 'down', key: 'ArrowRight'}, 'root')
			expect(harness.value()).toBe('100')
			expect(harness.events()).toEqual([])
		})
	})
}
