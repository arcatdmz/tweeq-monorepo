import {describe, expect, it} from 'vitest'

import {getCubicBezierPath, updateCubicBezierPoint} from './cubicBezier'

describe('cubic bezier helpers', () => {
	it('creates the SVG path', () => {
		expect(getCubicBezierPath([0.25, 0.1, 0.25, 1])).toBe(
			'M 0,0 C 0.25,0.1 0.25,1 1,1'
		)
	})

	it('updates and clamps one handle', () => {
		expect(updateCubicBezierPoint([0, 0, 1, 1], 0, -1, 2)).toEqual([0, 1, 1, 1])
	})
})
