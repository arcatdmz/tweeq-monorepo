import {describe, expect, it} from 'vitest'

import {
	compileNumberExpression,
	getInputNumberPrecision,
	updateNumberScrub,
} from './inputNumber'

describe('InputNumber core', () => {
	it('derives precision from step before display/range', () => {
		expect(
			getInputNumberPrecision({
				step: 0.01,
				display: '1.2345',
				width: 100,
				min: 0,
				max: 1,
				tweaking: false,
				speed: 1,
				precision: 4,
			})
		).toBe(2)
	})

	it('uses fixed pixels-per-step for unranged scrubbing', () => {
		const result = updateNumberScrub({
			state: {
				local: 1,
				directionAverage: [1, 0],
				offsetWeight: 1,
				gestureSpeed: 1,
			},
			delta: [20, 0],
			barVisible: false,
			min: -100,
			max: 100,
			width: 100,
			step: 0.1,
			speed: 1,
			minSpeed: 0.0001,
			maxSpeed: 1000,
		})
		expect(result.local).toBeCloseTo(1.1)
	})

	it('compiles numeric expressions with selection index', () => {
		expect(compileNumberExpression('x * 2 + i')(3, {i: 1})).toBe(7)
		expect(() => compileNumberExpression('"no"')(0, {i: 0})).toThrow()
	})
})
