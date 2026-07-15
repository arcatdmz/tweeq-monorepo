import {mat2d} from 'linearly'
import {describe, expect, it} from 'vitest'

import {getZuiDotState, getZuiVisibleRect} from './zui'

describe('ZUI geometry', () => {
	it('maps viewport bounds through the inverse transform', () => {
		const transform = mat2d.fromTranslation([10, 20])
		expect(getZuiVisibleRect(transform, [100, 80])).toEqual([
			[-10, -20],
			[90, 60],
		])
	})

	it('derives dot position, scale, and opacity', () => {
		const state = getZuiDotState([2, 0, 0, 2, 10, 20])
		expect(state.position).toEqual([10, 20])
		expect(state.size).toEqual([40, 40])
		expect(state.opacity).toBe(1)
	})
})
