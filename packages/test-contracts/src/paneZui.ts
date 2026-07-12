import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface PaneZuiContractProps {
	transform: readonly [number, number, number, number, number, number]
}

export function runPaneZuiContract(
	createHarness: RendererHarnessFactory<PaneZuiContractProps>
) {
	describe('PaneZUI renderer contract', () => {
		let harness: RendererHarness<PaneZuiContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders and synchronizes the controlled transform', async () => {
			harness = await createHarness('PaneZUI', {
				transform: [2, 0, 0, 2, 10, 20],
			})
			expect(harness.value()).toBe('matrix(2,0,0,2,10,20)')
			await harness.update({transform: [1, 0, 0, 1, -5, -6]})
			expect(harness.value()).toBe('matrix(1,0,0,1,-5,-6)')
		})
	})
}
