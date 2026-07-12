import {describe, expect, it} from 'vitest'

import {
	getRulerDefaultScales,
	getRulerPixelsPerUnit,
	getRulerScaleOffset,
	getRulerValueAtPixel,
} from './ruler'

describe('Ruler geometry', () => {
	it('generates integral scales within the visible range', () => {
		expect(getRulerDefaultScales([0.2, 3.8])).toEqual([
			{value: 1},
			{value: 2},
			{value: 3},
		])
		expect(getRulerDefaultScales([3, 2])).toEqual([])
	})

	it('maps values and pointer pixels through the range', () => {
		const pixelsPerUnit = getRulerPixelsPerUnit(200, [10, 20])
		expect(pixelsPerUnit).toBe(20)
		expect(getRulerScaleOffset(15, [10, 20], pixelsPerUnit)).toBe(100)
		expect(getRulerValueAtPixel(50, 200, [10, 20])).toBe(12.5)
	})

	it('keeps zero-sized geometry finite', () => {
		expect(getRulerPixelsPerUnit(200, [10, 10])).toBe(0)
		expect(getRulerValueAtPixel(50, 0, [10, 20])).toBe(10)
	})
})
