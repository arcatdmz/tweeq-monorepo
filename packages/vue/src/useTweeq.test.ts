import {describe, expect, it, vi} from 'vitest'

vi.mock('./components', () => ({}))

import {useTweeq} from './useTweeq'

describe('Vue useTweeq compatibility facade', () => {
	it('warns once and names its removal version', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

		useTweeq()
		useTweeq()

		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('2.0.0'))
		warn.mockRestore()
	})
})
