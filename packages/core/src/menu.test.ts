import {describe, expect, it} from 'vitest'

import {isPointInTriangle} from './menu'

describe('isPointInTriangle', () => {
	it('accepts points inside or on the safe corridor', () => {
		expect(
			isPointInTriangle(
				{x: 5, y: 5},
				{x: 0, y: 0},
				{x: 10, y: 0},
				{x: 10, y: 10}
			)
		).toBe(true)
		expect(
			isPointInTriangle(
				{x: 10, y: 5},
				{x: 0, y: 0},
				{x: 10, y: 0},
				{x: 10, y: 10}
			)
		).toBe(true)
	})

	it('rejects points outside the safe corridor', () => {
		expect(
			isPointInTriangle(
				{x: 2, y: 9},
				{x: 0, y: 0},
				{x: 10, y: 0},
				{x: 10, y: 10}
			)
		).toBe(false)
	})
})
