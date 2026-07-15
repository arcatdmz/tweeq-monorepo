import {describe, expect, it} from 'vitest'

import {getSwitchKeyValue, getSwitchTweakValue} from './inputSwitch'

describe('switch decisions', () => {
	it('toggles near the drag origin and resolves direction past the threshold', () => {
		expect(
			getSwitchTweakValue({
				dragging: true,
				initialX: 10,
				currentX: 12,
				valueOnTweak: false,
			})
		).toBe(true)
		expect(
			getSwitchTweakValue({
				dragging: true,
				initialX: 10,
				currentX: 4,
				valueOnTweak: true,
			})
		).toBe(false)
	})

	it('maps the legacy true/false shortcut families', () => {
		expect(getSwitchKeyValue(' ', false)).toBe(true)
		expect(getSwitchKeyValue('Y', false)).toBe(true)
		expect(getSwitchKeyValue('n', true)).toBe(false)
		expect(getSwitchKeyValue('x', true)).toBeUndefined()
	})
})
