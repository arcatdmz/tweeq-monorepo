import {describe, expect, it} from 'vitest'

import {decomposeVec2, getTranslateOverlayGeometry} from './inputTranslate'

describe('InputTranslate geometry', () => {
	it('decomposes scalar bounds', () => {
		expect(decomposeVec2(3)).toEqual([3, 3])
		expect(decomposeVec2([1, 2])).toEqual([1, 2])
	})

	it('positions the grid and bounded zero rectangle', () => {
		expect(
			getTranslateOverlayGeometry({
				value: [10, 20],
				min: [0, 0],
				max: [100, 100],
				scale: 2,
			})
		).toEqual({
			grid: {
				backgroundSize: '20px 20px',
				backgroundPosition: '129px 109px',
			},
			zero: {
				left: '130px',
				top: '110px',
				width: '200px',
				height: '200px',
			},
		})
	})
})
