import {describe, expect, it} from 'vitest'

import {
	advanceDrumDragIndex,
	consumeDrumWheel,
	findDrumTypeAheadIndex,
	getDrumCellWidth,
	getDrumClickOffset,
} from './inputDrum'

describe('getDrumCellWidth', () => {
	it('uses an even visible cell count and caps excessive gaps', () => {
		expect(
			getDrumCellWidth({
				measuredLabelWidth: 30,
				viewportWidth: 300,
				emPx: 10,
			})
		).toBe(30)
		expect(
			getDrumCellWidth({
				measuredLabelWidth: 80,
				viewportWidth: 400,
				emPx: 10,
			})
		).toBe(100)
	})
})

describe('InputDrum interaction helpers', () => {
	it('advances and clamps fractional drag indices', () => {
		expect(advanceDrumDragIndex(2, 20, 5)).toBe(1.5)
		expect(advanceDrumDragIndex(0, 80, 5)).toBe(0)
	})

	it('maps viewport clicks to relative cells', () => {
		expect(getDrumClickOffset(200, 300, 50)).toBe(1)
		expect(getDrumClickOffset(75, 300, 50)).toBe(-1)
	})

	it('consumes every complete wheel step and preserves the remainder', () => {
		expect(consumeDrumWheel(10, 65)).toEqual({steps: 3, remainder: 3})
		expect(consumeDrumWheel(-10, -40)).toEqual({steps: -2, remainder: -2})
	})

	it('matches type-ahead labels case-insensitively', () => {
		expect(findDrumTypeAheadIndex(['Auto', '100', '150'], '15')).toBe(2)
		expect(findDrumTypeAheadIndex(['Auto'], 'x')).toBe(-1)
	})
})
