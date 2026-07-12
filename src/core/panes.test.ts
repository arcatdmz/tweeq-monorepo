import {describe, expect, it} from 'vitest'

import {clampSplitSize, resizeFloatingPane} from './panes'

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
})
