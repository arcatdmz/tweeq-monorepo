import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface PaneSplitContractProps {
	direction: 'horizontal' | 'vertical'
	size: number
	fixed?: 'first' | 'second'
	min?: number
}

export function runPaneSplitContract(
	createHarness: RendererHarnessFactory<PaneSplitContractProps>
) {
	describe('PaneSplit renderer contract', () => {
		let harness: RendererHarness<PaneSplitContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('resizes proportional panes from pointer movement', async () => {
			harness = await createHarness('PaneSplit', {
				direction: 'horizontal',
				size: 50,
			})
			await harness.pointer({type: 'down', x: 250, y: 100}, 'divider')
			await harness.pointer({type: 'move', x: 350, y: 100}, 'divider')
			await harness.pointer({type: 'up', x: 350, y: 100}, 'divider')
			expect(harness.value()).toBe('70%')
		})

		it('honors min while resizing a fixed second pane', async () => {
			harness = await createHarness('PaneSplit', {
				direction: 'horizontal',
				size: 200,
				fixed: 'second',
				min: 80,
			})
			await harness.pointer({type: 'down', x: 250, y: 100}, 'divider')
			await harness.pointer({type: 'move', x: 430, y: 100}, 'divider')
			await harness.pointer({type: 'up', x: 430, y: 100}, 'divider')
			expect(harness.value()).toBe('80px')
		})

		it('exposes separator semantics and resizes horizontal panes by key', async () => {
			harness = await createHarness('PaneSplit', {
				direction: 'horizontal',
				size: 50,
			})
			const divider = harness.part('divider')
			expect(divider?.getAttribute('role')).toBe('separator')
			expect(divider?.getAttribute('tabindex')).toBe('0')
			expect(divider?.getAttribute('aria-orientation')).toBe('vertical')
			expect(divider?.getAttribute('aria-valuemin')).toBe('10')
			expect(divider?.getAttribute('aria-valuemax')).toBe('90')
			expect(divider?.getAttribute('aria-valuenow')).toBe('50')
			expect(divider?.getAttribute('aria-valuetext')).toBe('50%')

			await harness.key({type: 'press', key: 'ArrowRight'}, 'divider')
			expect(harness.value()).toBe('51%')
			expect(divider?.getAttribute('aria-valuenow')).toBe('51')
			await harness.key(
				{type: 'press', key: 'ArrowLeft', shiftKey: true},
				'divider'
			)
			expect(harness.value()).toBe('41%')
			await harness.key({type: 'press', key: 'Home'}, 'divider')
			expect(harness.value()).toBe('10%')
			await harness.key({type: 'press', key: 'End'}, 'divider')
			expect(harness.value()).toBe('90%')
		})

		it('moves a vertical fixed-second divider in visual direction', async () => {
			harness = await createHarness('PaneSplit', {
				direction: 'vertical',
				size: 80,
				fixed: 'second',
				min: 40,
			})
			await harness.key({type: 'press', key: 'ArrowDown'}, 'divider')
			expect(harness.value()).toBe('70px')
			const divider = harness.part('divider')
			expect(divider?.getAttribute('aria-orientation')).toBe('horizontal')
			expect(divider?.getAttribute('aria-valuemin')).toBe('40')
			expect(divider?.getAttribute('aria-valuemax')).toBe('160')
			expect(divider?.getAttribute('aria-valuenow')).toBe('130')
			expect(divider?.getAttribute('aria-valuetext')).toBe('130px')

			await harness.key(
				{type: 'press', key: 'ArrowUp', shiftKey: true},
				'divider'
			)
			expect(harness.value()).toBe('120px')
			await harness.key({type: 'press', key: 'Home'}, 'divider')
			expect(harness.value()).toBe('160px')
			await harness.key({type: 'press', key: 'End'}, 'divider')
			expect(harness.value()).toBe('40px')
		})
	})
}
