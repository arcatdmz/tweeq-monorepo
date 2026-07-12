import {describe, expect, it} from 'vitest'

import {getDrumCellWidth} from './inputDrum'

describe('getDrumCellWidth', () => {
	it('uses an even visible cell count and caps excessive gaps', () => {
		expect(
			getDrumCellWidth({
				measuredLabelWidth: 30,
				viewportWidth: 300,
				emPx: 10,
			})
		).toBe(30)
		expect(
			getDrumCellWidth({
				measuredLabelWidth: 80,
				viewportWidth: 400,
				emPx: 10,
			})
		).toBe(100)
	})
})
