import {describe, expect, it} from 'vitest'

import {
	clampPosWithinRect,
	getRotaryDragValue,
	signedAngleBetween,
} from './inputRotary'

describe('InputRotary geometry', () => {
	it('finds the shortest signed angle', () => {
		expect(signedAngleBetween(10, 350)).toBe(20)
		expect(signedAngleBetween(350, 10)).toBe(-20)
	})

	it('clamps a label ray to the viewport rectangle', () => {
		expect(
			clampPosWithinRect(
				[50, 50],
				[200, 50],
				[
					[0, 0],
					[100, 100],
				]
			)
		).toEqual([100, 50])
	})

	it('keeps relative accumulation unsnapped while toggling 45 degree snap', () => {
		let result = getRotaryDragValue(30, 8, 45, true)
		expect(result).toEqual({local: 38, output: 45})

		result = getRotaryDragValue(result.local, 2, 45, true)
		expect(result).toEqual({local: 40, output: 45})

		result = getRotaryDragValue(result.local, 2, 45, false)
		expect(result).toEqual({local: 42, output: 42})
	})
})
