import {afterEach, describe, expect, it, vi} from 'vitest'

import {fromEnum, fromNumber, fromString} from './inputShuffle'

// Generators re-roll so the previous value never repeats while an alternative
// exists.

afterEach(() => {
	vi.restoreAllMocks()
})

describe('fromNumber', () => {
	it('snaps to the step grid within [min, max)', () => {
		vi.spyOn(Math, 'random').mockReturnValueOnce(0.5)
		const generate = fromNumber(10, 20, 2)
		const next = generate(0)
		expect(next).toBeGreaterThanOrEqual(10)
		expect(next).toBeLessThan(20)
		expect((next - 10) % 2).toBe(0)
	})

	it('draws continuously when step is 0', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.25)
		expect(fromNumber(0, 8, 0)(999)).toBe(2)
	})

	it('re-rolls instead of repeating the previous value', () => {
		// First roll collides with prev (index 0), the retry must move on.
		const rolls = [0, 0.9]
		vi.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0.9)
		const generate = fromNumber(0, 3, 1)
		expect(generate(0)).not.toBe(0)
	})
})

describe('fromEnum', () => {
	it('never repeats when an alternative exists', () => {
		const rolls = [0, 0.99]
		vi.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0.99)
		expect(fromEnum(['a', 'b', 'c'])('a')).not.toBe('a')
	})

	it('returns the same value for a one-element space', () => {
		expect(fromEnum(['only'])('only')).toBe('only')
	})
})

describe('fromString', () => {
	it('generates the requested length from the charset', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		const generate = fromString({length: 4, charset: 'ab'})
		const next = generate('')
		expect(next).toHaveLength(4)
		expect(next).toMatch(/^[ab]{4}$/)
	})
})
