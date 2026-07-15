import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface TimelineContractProps {
	frameRange: [number, number]
	frameWidth?: number
	frameWidthRange?: [number, number]
	overscroll?: number
}

export function runTimelineContract(
	createHarness: RendererHarnessFactory<TimelineContractProps>
) {
	describe('Timeline renderer contract', () => {
		let harness: RendererHarness<TimelineContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('exposes stable layout parts and both content slots', async () => {
			harness = await createHarness('Timeline', {frameRange: [0, 100]})
			expect(harness.part('root')).not.toBeNull()
			expect(harness.part('fixed')).not.toBeNull()
			expect(harness.part('scrollbar')).not.toBeNull()
			expect(harness.part('knob')).not.toBeNull()
			expect(harness.part('content-probe')).not.toBeNull()
			expect(harness.part('scrollbar-probe')).not.toBeNull()
		})

		it('reports bounded Alt-wheel zoom through the controlled API', async () => {
			harness = await createHarness('Timeline', {
				frameRange: [0, 100],
				frameWidth: 60,
				frameWidthRange: [10, 70],
			})
			await harness.pointer(
				{type: 'wheel', x: 0, y: 0, deltaY: 100, altKey: true},
				'fixed'
			)
			expect(harness.value()).toBe(70)
			expect(harness.events()).toContainEqual({
				name: 'changeFrameWidth',
				payload: [70],
			})
		})

		it('pans without changing frame width', async () => {
			harness = await createHarness('Timeline', {
				frameRange: [0, 100],
				frameWidth: 60,
			})
			await harness.pointer(
				{type: 'wheel', x: 0, y: 0, deltaY: 48},
				'fixed'
			)
			expect(harness.value()).toBe(60)
			expect(harness.events()).toEqual([])
		})
	})
}
