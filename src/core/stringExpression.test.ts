import {describe, expect, it} from 'vitest'

import {compileStringExpression} from './stringExpression'

describe('compileStringExpression', () => {
	it('supports string/number results and selection index', () => {
		expect(compileStringExpression('x + i')('a', {i: 2})).toBe('a2')
		expect(compileStringExpression('i * 3')('ignored', {i: 2})).toBe('6')
	})

	it('rejects non-string-like results', () => {
		expect(() => compileStringExpression('({})')('x', {i: 0})).toThrow(
			'Value is not a string or number'
		)
	})
})
