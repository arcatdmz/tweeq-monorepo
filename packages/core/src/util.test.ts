import {describe, expect, it} from 'vitest'

import {
	getNumberPresition,
	precisionOf,
	toFixed,
	toPercent,
	unsignedMod,
} from './util'

describe('precisionOf', () => {
	it('returns the number of decimals a step needs', () => {
		expect(precisionOf(1)).toBe(0)
		expect(precisionOf(0.1)).toBe(1)
		expect(precisionOf(0.25)).toBe(1)
		expect(precisionOf(0.01)).toBe(2)
	})

	it('returns 0 for step 0', () => {
		expect(precisionOf(0)).toBe(0)
	})
})

describe('toFixed', () => {
	it('formats with fixed decimals, trimming trailing zeros', () => {
		expect(toFixed(1.5, 3)).toBe('1.5')
		expect(toFixed(1.23456, 2)).toBe('1.23')
		expect(toFixed(2, 3)).toBe('2')
	})
})

describe('getNumberPresition', () => {
	it('counts digits after the decimal point', () => {
		expect(getNumberPresition('1.234')).toBe(3)
		expect(getNumberPresition('1.234000')).toBe(6)
		expect(getNumberPresition('1')).toBe(0)
	})
})

describe('unsignedMod', () => {
	it('wraps negatives into the positive range', () => {
		expect(unsignedMod(-1, 3)).toBe(2)
		expect(unsignedMod(4, 3)).toBe(1)
	})
})

describe('toPercent', () => {
	it('formats a ratio as a percentage', () => {
		expect(toPercent(0.5)).toBe('50%')
	})
})
