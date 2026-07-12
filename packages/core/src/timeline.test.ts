import {describe, expect, it} from 'vitest'

import {clampTimelineRange, showTimelineRange} from './timeline'

describe('timeline ranges', () => {
	it('clamps pan while preserving duration', () => {
		expect(clampTimelineRange([-100, -90], [0, 100], 0.5)).toEqual([-5, 5])
	})

	it('reveals a requested range without changing duration when possible', () => {
		expect(showTimelineRange([10, 20], 25)).toEqual([16, 26])
		expect(showTimelineRange([10, 20], [0, 30])).toEqual([0, 30])
	})
})
