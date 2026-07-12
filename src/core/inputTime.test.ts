import {describe, expect, it} from 'vitest'

import {
	compileTimeExpression,
	formatTimecode,
	parseTimecode,
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
		expect(compileTimeExpression('1s + i', 24)(0, {i: 2, fps: 24})).toEqual({
			value: 26,
			log: [],
		})
	})
})
