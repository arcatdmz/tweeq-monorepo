import {describe, expect, it} from 'vitest'

import {clamp, colorCode, compose, identity, quantize} from './validator'

describe('clamp', () => {
	it('passes values inside the range through', () => {
		expect(clamp(0, 10)(5)).toEqual({value: 5, log: []})
	})

	it('clamps and logs values below the minimum', () => {
		expect(clamp(0, 10)(-3)).toEqual({value: 0, log: ['should be >= 0']})
	})

	it('clamps and logs values above the maximum', () => {
		expect(clamp(0, 10)(12)).toEqual({value: 10, log: ['should be <= 10']})
	})
})

describe('quantize', () => {
	it('passes multiples of the step through', () => {
		expect(quantize(0.5)(1.5)).toEqual({value: 1.5, log: []})
	})

	it('snaps off-step values and logs', () => {
		const result = quantize(0.5)(1.26)
		expect(result.value).toBeCloseTo(1.5)
		expect(result.log).toEqual(['should be a multiple of 0.5'])
	})

	it('is a no-op for step 0', () => {
		expect(quantize(0)(1.234)).toEqual({value: 1.234, log: []})
	})
})

describe('colorCode', () => {
	it('accepts valid CSS colors', () => {
		expect(colorCode('#ff0000')).toEqual({value: '#ff0000', log: []})
		expect(colorCode('rgb(0, 0, 0)').value).toBe('rgb(0, 0, 0)')
	})

	it('rejects invalid colors with undefined value', () => {
		expect(colorCode('not-a-color')).toEqual({
			value: undefined,
			log: ['Invalid color code'],
		})
	})
})

describe('compose', () => {
	it('runs validators left to right, accumulating logs', () => {
		const validator = compose(clamp(0, 10), quantize(2))
		expect(validator(11)).toEqual({
			value: 10,
			log: ['should be <= 10'],
		})
		expect(validator(3)).toEqual({
			value: 4,
			log: ['should be a multiple of 2'],
		})
	})

	it('skips null/undefined validators', () => {
		expect(compose<number>(null, undefined, identity)(42).value).toBe(42)
	})

	it('stops validating once the value becomes undefined', () => {
		const reject: typeof identity = () => ({value: undefined, log: ['nope']})
		const result = compose<any>(reject, identity)('x')
		expect(result).toEqual({value: undefined, log: ['nope']})
	})
})
