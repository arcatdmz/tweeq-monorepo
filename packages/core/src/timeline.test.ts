import {describe, expect, it} from 'vitest'

import {
	centerTimelineFrame,
	clampTimelineRange,
	panTimelineRange,
	showTimelineRange,
	zoomTimelineRange,
} from './timeline'

describe('timeline ranges', () => {
	it('clamps pan while preserving duration', () => {
		expect(clampTimelineRange([-100, -90], [0, 100], 0.5)).toEqual([-5, 5])
	})

	it('reveals a requested range without changing duration when possible', () => {
		expect(showTimelineRange([10, 20], 25)).toEqual([16, 26])
		expect(showTimelineRange([10, 20], [0, 30])).toEqual([0, 30])
	})

	it('pans in pixels and clamps to the scroll bounds', () => {
		expect(panTimelineRange([0, 10], 100, 10, [0, 100], 0.5)).toEqual([
			10, 20,
		])
		expect(panTimelineRange([85, 95], 100, 10, [0, 100], 0.5)).toEqual([
			95, 105,
		])
	})

	it('zooms around an origin and centers a frame', () => {
		expect(zoomTimelineRange([0, 20], 5, 2, [0, 100], 0.5)).toEqual([
			2.5, 12.5,
		])
		expect(centerTimelineFrame([0, 20], 50)).toEqual([40, 60])
	})
})
