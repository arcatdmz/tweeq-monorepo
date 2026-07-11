import {describe, expect, it} from 'vitest'

import {getBalloonGeometry} from './balloon'

describe('getBalloonGeometry', () => {
	it('adds top arrow depth and points at the requested offset', () => {
		const geometry = getBalloonGeometry(100, 40, {
			arrowSide: 'top',
			arrowOffset: 50,
			radius: 10,
		})

		expect(geometry.layerWidth).toBe(100)
		expect(geometry.layerHeight).toBe(49)
		expect(geometry.path).toContain('L 50,2')
		expect(geometry.wrapperPadding.paddingTop).toBe('9px')
		expect(geometry.transformOrigin).toBe('50px 2px')
	})

	it('clamps an arrow away from rounded corners', () => {
		const geometry = getBalloonGeometry(100, 40, {
			arrowSide: 'bottom',
			arrowOffset: 0,
			radius: 10,
		})

		expect(geometry.path).toContain('L 17,47')
	})
})
