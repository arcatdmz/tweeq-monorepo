import {describe, expect, it} from 'vitest'

import {getLabelizer} from './types'

describe('getLabelizer', () => {
	it('matches labelled values with SameValue semantics', () => {
		const label = getLabelizer({
			options: [NaN, -0, 0],
			labels: ['Not a number', 'Negative zero', 'Zero'],
		})

		expect(label(NaN)).toBe('Not a number')
		expect(label(-0)).toBe('Negative zero')
		expect(label(0)).toBe('Zero')
	})
})
