import {describe, expect, it} from 'vitest'

import {clampPosWithinRect, signedAngleBetween} from './inputRotary'

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
})
