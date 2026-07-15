import {describe, expect, it} from 'vitest'

import {isPointInTriangle, type MenuItem, moveMenuFocus} from './menu'

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

describe('menu focus', () => {
	it('moves through enabled commands and groups with wrapping', () => {
		const items: MenuItem[] = [
			{label: 'First', perform() {}},
			{separator: true},
			{label: 'Disabled', disabled: true, perform() {}},
			{label: 'Group', children: []},
		]
		expect(moveMenuFocus(items, 0, 'ArrowDown')).toBe(3)
		expect(moveMenuFocus(items, 3, 'ArrowDown')).toBe(0)
		expect(moveMenuFocus(items, 0, 'ArrowUp')).toBe(3)
		expect(moveMenuFocus(items, 3, 'Home')).toBe(0)
		expect(moveMenuFocus(items, 0, 'End')).toBe(3)
		expect(moveMenuFocus(items, 0, 'ArrowRight')).toBeUndefined()
	})
})
