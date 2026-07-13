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
			const root = harness.part('root') as HTMLElement
			expect(root.getAttribute('data-tq-component')).toBe('pane-floating')
			expect(root.getAttribute('data-tq-anchor')).toBe('right-top')
			expect(root.hasAttribute('data-tq-anchor-top')).toBe(true)
			expect(root.hasAttribute('data-tq-anchor-right')).toBe(true)
			expect(root.hasAttribute('data-tq-anchor-bottom')).toBe(false)
			expect(root.hasAttribute('data-tq-anchor-left')).toBe(false)
			expect(harness.part('top')?.getAttribute('data-tq-resize-edge')).toBe(
				'top'
			)
			expect(harness.part('right')?.getAttribute('data-tq-resize-edge')).toBe(
				'right'
			)
			expect(harness.part('bottom')?.getAttribute('data-tq-resize-edge')).toBe(
				'bottom'
			)
			expect(harness.part('left')?.getAttribute('data-tq-resize-edge')).toBe(
				'left'
			)
			expect(harness.part('wrapper')).toBeTruthy()
			expect(harness.part('content')).toBeTruthy()
			await harness.pointer({type: 'down', x: 0, y: 200}, 'left')
			await harness.pointer({type: 'move', x: 350, y: 200}, 'left')
			await harness.pointer({type: 'up', x: 350, y: 200}, 'left')
			expect(harness.value()).toEqual({
				anchor: 'right-top',
				width: 'minimized',
				height: 400,
			})
			expect(root.hasAttribute('data-tq-width-minimized')).toBe(true)
		})
	})
}
