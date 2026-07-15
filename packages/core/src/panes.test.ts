import {describe, expect, it} from 'vitest'

import {
	clampSplitSize,
	getSplitPaneSeparatorValues,
	resizeFloatingPane,
	resizeSplitPane,
	resizeSplitPaneFromKeyboard,
} from './panes'

describe('pane geometry', () => {
	it('clamps proportional and fixed splits', () => {
		expect(clampSplitSize({value: 4, fixed: false, viewportSize: 100})).toBe(10)
		expect(clampSplitSize({value: 490, fixed: true, viewportSize: 500})).toBe(
			460
		)
	})

	it('migrates floating anchors at resize extremes', () => {
		expect(
			resizeFloatingPane({
				position: {anchor: 'right', width: 300},
				axis: 'width',
				edge: 'near',
				current: 800,
				viewport: 800,
			})
		).toEqual({anchor: 'maximized'})
		expect(
			resizeFloatingPane({
				position: {anchor: 'top', height: 200},
				axis: 'width',
				edge: 'far',
				current: 240,
				viewport: 800,
			})
		).toEqual({anchor: 'left-top', width: 240, height: 200})
	})

	it('resizes proportional and fixed splits from pointer movement', () => {
		expect(
			resizeSplitPane({start: 50, movement: 100, viewportSize: 400})
		).toBe(75)
		expect(
			resizeSplitPane({
				start: 200,
				movement: 180,
				fixed: 'second',
				viewportSize: 500,
				minPixelSize: 80,
			})
		).toBe(80)
	})

	it('resizes the divider from orientation-aware keyboard input', () => {
		expect(
			resizeSplitPaneFromKeyboard({
				current: 50,
				key: 'ArrowRight',
				direction: 'horizontal',
				viewportSize: 500,
			})
		).toBe(51)
		expect(
			resizeSplitPaneFromKeyboard({
				current: 200,
				key: 'ArrowDown',
				direction: 'vertical',
				fixed: 'second',
				viewportSize: 500,
			})
		).toBe(190)
		expect(
			resizeSplitPaneFromKeyboard({
				current: 50,
				key: 'ArrowDown',
				direction: 'horizontal',
				viewportSize: 500,
			})
		).toBeUndefined()
		expect(
			resizeSplitPaneFromKeyboard({
				current: 50,
				key: 'End',
				direction: 'horizontal',
				viewportSize: 500,
			})
		).toBe(90)
	})

	it('reports separator position for proportional and either fixed pane', () => {
		expect(
			getSplitPaneSeparatorValues({size: 65, viewportSize: 500})
		).toEqual({min: 10, max: 90, now: 65, text: '65%'})
		expect(
			getSplitPaneSeparatorValues({
				size: 120,
				fixed: 'second',
				viewportSize: 500,
				minPixelSize: 80,
			})
		).toEqual({min: 80, max: 420, now: 380, text: '380px'})
	})
})
