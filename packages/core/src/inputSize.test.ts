import {describe, expect, it} from 'vitest'

import {updateSizeWithRatio} from './inputSize'

describe('updateSizeWithRatio', () => {
	it('scales the untouched axis while ratio lock is active', () => {
		expect(
			updateSizeWithRatio({
				previous: [100, 50],
				next: [200, 50],
				valueOnEdit: [100, 50],
				keepRatio: true,
			})
		).toEqual({value: [200, 100], keepRatio: true})
	})

	it('drops ratio lock when both axes change disproportionately', () => {
		expect(
			updateSizeWithRatio({
				previous: [100, 50],
				next: [200, 80],
				valueOnEdit: [100, 50],
				keepRatio: true,
			})
		).toEqual({value: [200, 80], keepRatio: false})
	})
})
