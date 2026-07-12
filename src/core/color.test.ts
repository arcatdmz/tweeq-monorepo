import {describe, expect, it} from 'vitest'

import {css2hsva, hsv2rgb, hsva2hex, rgb2hsv, setHSVAChannel} from './color'

describe('color conversion', () => {
	it('round-trips RGB and HSV', () => {
		const rgb = {r: 0.2, g: 0.6, b: 0.9}
		const result = hsv2rgb(rgb2hsv(rgb))
		expect(result.r).toBeCloseTo(rgb.r)
		expect(result.g).toBeCloseTo(rgb.g)
		expect(result.b).toBeCloseTo(rgb.b)
	})

	it('parses CSS and preserves alpha in hexadecimal output', () => {
		const color = css2hsva('rgba(255, 0, 0, .5)')
		expect(color).toMatchObject({h: 0, s: 1, v: 1, a: 0.5})
		expect(hsva2hex(color)).toBe('#ff000080')
	})

	it('wraps hue and preserves hue through achromatic channel edits', () => {
		const color = {h: 1 / 6, s: 1, v: 1, a: 1}
		expect(setHSVAChannel(color, 'h', 1.25).h).toBe(0.25)
		expect(setHSVAChannel(color, 'b', 1).h).toBe(1 / 6)
	})
})
