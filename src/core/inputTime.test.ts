import {describe, expect, it} from 'vitest'

import {
	compileTimeExpression,
	formatTimecode,
	parseTimecode,
	quantizeTimeTweakValue,
	replaceTimecodeWithFrames,
} from './inputTime'

describe('timecode', () => {
	it('formats and parses frame values', () => {
		expect(formatTimecode(24 * 61 + 3, 24)).toBe('01:01:03')
		expect(parseTimecode('-00:01:12', 24)).toBe(-36)
		expect(parseTimecode('5seconds', 30)).toBe(150)
	})

	it('replaces time literals in expressions', () => {
		expect(replaceTimecodeWithFrames('20sec + 3min', 24)).toBe('480 + 4320')
		expect(replaceTimecodeWithFrames('00:24 + 1:00', 24)).toBe('24 + 24')
		expect(replaceTimecodeWithFrames('1:00', 30)).toBe('30')
		expect(replaceTimecodeWithFrames('{10f}', 24)).toBe('{10}')
		expect(replaceTimecodeWithFrames(' (20SEC) + 3min * 1:00 ', 24)).toBe(
			' (480) + 4320 * 24 '
		)
		expect(replaceTimecodeWithFrames('hr(1.5h)\n10s', 24)).toBe(
			'hr(129600)\n240'
		)
		expect(compileTimeExpression('1s + i', 24)(0, {i: 2, fps: 24})).toEqual({
			value: 26,
			log: [],
		})
	})

	it('parses frame, second, minute, and hour suffixes', () => {
		expect(parseTimecode('100Frames', 24)).toBe(100)
		expect(parseTimecode('5seconds', 30)).toBe(150)
		expect(parseTimecode('10minutes', 30)).toBe(18_000)
		expect(parseTimecode('10hours', 30)).toBe(1_080_000)
		expect(parseTimecode('-100Frames', 24)).toBe(-100)
	})
})

describe('time tweaking', () => {
	it('always exposes whole frames from the continuous drag accumulator', () => {
		expect(quantizeTimeTweakValue(24.25, 24, 0, false, 24)).toBe(24)
		expect(quantizeTimeTweakValue(24.75, 24, 3, false, 24)).toBe(25)
	})

	it('snaps to the active time unit while preserving its starting offset', () => {
		// Starting at frame 25 means second snapping stays on 1, 25, 49, ...
		expect(quantizeTimeTweakValue(26, 24, 1, true, 25)).toBe(25)
		expect(quantizeTimeTweakValue(38, 24, 1, true, 25)).toBe(49)
		expect(quantizeTimeTweakValue(700, 24, 2, true, 25)).toBe(25)
		expect(quantizeTimeTweakValue(800, 24, 2, true, 25)).toBe(1465)
	})
})
