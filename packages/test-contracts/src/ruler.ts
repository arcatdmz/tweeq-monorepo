import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface RulerContractProps {
	range: [number, number]
	scales?: Array<{value: number; label?: string; opacity?: number}>
}

export function runRulerContract(
	createHarness: RendererHarnessFactory<RulerContractProps>
) {
	describe('Ruler renderer contract', () => {
		let harness: RendererHarness<RulerContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders core-generated integral scales and stable parts', async () => {
			harness = await createHarness('Ruler', {range: [0.2, 2.8]})
			const root = harness.part('root') as HTMLElement
			expect(harness.part('content')).not.toBeNull()
			expect(harness.part('content-probe')).not.toBeNull()
			expect(
				Array.from(root.querySelectorAll('[data-tq-part="scale"]')).map(
					scale => scale.textContent?.trim()
				)
			).toEqual(['1', '2'])
		})

		it('follows controlled custom scales', async () => {
			harness = await createHarness('Ruler', {
				range: [0, 10],
				scales: [{value: 5, label: 'Middle', opacity: 0.5}],
			})
			const scale = harness.part('scale') as HTMLElement
			expect(scale.textContent?.trim()).toBe('Middle')
			expect(scale.style.opacity).toBe('0.5')

			await harness.update({scales: [{value: 8, label: 'Later'}]})
			expect(harness.part('scale')?.textContent?.trim()).toBe('Later')
		})
	})
}
