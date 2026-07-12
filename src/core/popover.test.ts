import {describe, expect, it} from 'vitest'

import {getPopoverGeometry, getPopoverPositionStyles} from './popover'

describe('popover geometry', () => {
	it('maps string placement to CSS anchor positioning', () => {
		expect(
			getPopoverPositionStyles(
				'bottom-start',
				{mainAxis: 6, crossAxis: 2},
				'--anchor'
			)
		).toMatchObject({
			positionAnchor: '--anchor',
			top: 'anchor(bottom)',
			left: 'anchor(left)',
			marginTop: '6px',
			marginLeft: '2px',
		})
	})

	it('shifts a bottom popover into the viewport and derives its arrow', () => {
		const geometry = getPopoverGeometry({
			reference: {
				left: 180,
				right: 200,
				top: 20,
				bottom: 40,
				width: 20,
				height: 20,
			},
			popover: {
				left: 160,
				right: 220,
				top: 40,
				bottom: 80,
				width: 60,
				height: 40,
			},
			placement: 'bottom',
			currentShiftX: 0,
			currentShiftY: 0,
			viewportWidth: 200,
			viewportHeight: 100,
			arrow: true,
		})

		expect(geometry).toEqual({
			shiftX: -28,
			shiftY: 0,
			arrowSide: 'top',
			arrowOffset: 58,
		})
	})

	it('also shifts along the placement axis when neither flip can fit', () => {
		expect(
			getPopoverGeometry({
				reference: {
					left: 20,
					right: 40,
					top: 80,
					bottom: 100,
					width: 20,
					height: 20,
				},
				popover: {
					left: 20,
					right: 120,
					top: 100,
					bottom: 260,
					width: 100,
					height: 160,
				},
				placement: 'bottom-start',
				currentShiftX: 0,
				currentShiftY: 0,
				viewportWidth: 200,
				viewportHeight: 180,
				arrow: false,
			})
		).toMatchObject({shiftX: 0, shiftY: -88})
	})
})
