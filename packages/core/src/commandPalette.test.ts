import {describe, expect, it} from 'vitest'

import {moveCommandSelection, updateCommandHistory} from './commandPalette'

describe('CommandPalette state', () => {
	it('deduplicates and limits recent commands', () => {
		expect(updateCommandHistory(['b', 'a', 'c'], 'a', 3)).toEqual([
			'a',
			'b',
			'c',
		])
	})

	it('wraps selection and handles an empty result list', () => {
		expect(moveCommandSelection(0, -1, 3)).toBe(2)
		expect(moveCommandSelection(2, 1, 3)).toBe(0)
		expect(moveCommandSelection(0, 1, 0)).toBe(-1)
	})
})
