import {describe, expect, it} from 'vitest'

import {rectCenter, rectsIntersect, uniteRects} from './geometry'
import {svgArc, svgLine} from './svgPath'

describe('geometry and SVG paths', () => {
	it('combines and intersects rectangles', () => {
		const united = uniteRects([[0, 2], [4, 5]], [[3, 0], [8, 3]])
		expect(united).toEqual([[0, 0], [8, 5]])
		expect(rectCenter(united)).toEqual([4, 2.5])
		expect(rectsIntersect([[0, 0], [2, 2]], [[3, 3], [4, 4]])).toBe(false)
	})

	it('creates line and arc path data', () => {
		expect(svgLine([0, 1], [2, 3])).toBe('M 0 1 L 2 3')
		expect(svgArc([0, 0], 10, 0, 90)).toContain('A 10 10 0 0 1')
	})
})
