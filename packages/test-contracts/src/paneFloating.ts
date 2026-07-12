import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface PaneFloatingContractProps {
	position: {anchor: 'right-top'; width: number; height: number}
}

export function runPaneFloatingContract(
	createHarness: RendererHarnessFactory<PaneFloatingContractProps>
) {
	describe('PaneFloating renderer contract', () => {
		let harness: RendererHarness<PaneFloatingContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('uses the shared edge transition to minimize width', async () => {
			harness = await createHarness('PaneFloating', {
				position: {anchor: 'right-top', width: 400, height: 400},
			})
			await harness.pointer({type: 'down', x: 0, y: 200}, 'left')
			await harness.pointer({type: 'move', x: 350, y: 200}, 'left')
			await harness.pointer({type: 'up', x: 350, y: 200}, 'left')
			expect(harness.value()).toEqual({
				anchor: 'right-top',
				width: 'minimized',
				height: 400,
			})
		})
	})
}
