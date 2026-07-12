import {describe, expect, it} from 'vitest'

import {getDropdownTop} from './dropdown'

describe('getDropdownTop', () => {
	it('aligns the selected row while keeping a fitting list on screen', () => {
		expect(
			getDropdownTop({
				triggerTop: 200,
				selectedIndex: 2,
				itemHeight: 32,
				listHeight: 160,
				viewportHeight: 400,
			})
		).toBe(132)
	})

	it('leaves one row visible for a taller-than-viewport list', () => {
		expect(
			getDropdownTop({
				triggerTop: 500,
				selectedIndex: 0,
				itemHeight: 32,
				listHeight: 1000,
				viewportHeight: 400,
			})
		).toBe(362)
	})
})
