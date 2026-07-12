import {describe, expect, it} from 'vitest'

import {getDropdownNextOption, getDropdownTop} from './dropdown'

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

describe('getDropdownNextOption', () => {
	it('wraps in both directions', () => {
		expect(getDropdownNextOption(['a', 'b', 'c'], 'c', 1)).toBe('a')
		expect(getDropdownNextOption(['a', 'b', 'c'], 'a', -1)).toBe('c')
	})

	it('starts from the first option when current is absent', () => {
		expect(getDropdownNextOption(['a', 'b'], 'missing', 1)).toBe('a')
	})

	it('returns undefined for an empty filtered list', () => {
		expect(getDropdownNextOption([], 'missing', 1)).toBeUndefined()
	})
})
