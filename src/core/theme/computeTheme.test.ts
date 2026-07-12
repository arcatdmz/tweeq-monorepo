import {describe, expect, it} from 'vitest'

import {computeTheme} from './computeTheme'

describe('computeTheme', () => {
	it('generates the default light theme (snapshot)', () => {
		const {theme, monacoTheme} = computeTheme({
			colorMode: 'light',
			accentColor: '#0000ff',
			grayColor: '#8B8D98',
			backgroundColor: '#ffffff',
		})

		expect(theme).toMatchSnapshot()
		expect(monacoTheme).toMatchSnapshot()
	})

	it('generates a dark theme with a custom accent (snapshot)', () => {
		const {theme, monacoTheme} = computeTheme({
			colorMode: 'dark',
			accentColor: '#46a758',
			grayColor: '#8B8D98',
			backgroundColor: '#111111',
		})

		expect(theme).toMatchSnapshot()
		expect(monacoTheme).toMatchSnapshot()
	})

	it('keeps structural invariants', () => {
		const light = computeTheme({
			colorMode: 'light',
			accentColor: '#0000ff',
			grayColor: '#8B8D98',
			backgroundColor: '#ffffff',
		})
		const dark = computeTheme({
			colorMode: 'dark',
			accentColor: '#0000ff',
			grayColor: '#8B8D98',
			backgroundColor: '#111111',
		})

		// Backgrounds pass through as full 6-digit sRGB hex (Monaco rejects
		// collapsed 3-digit hex).
		expect(light.theme.colorBackground).toBe('#ffffff')
		expect(dark.theme.colorBackground).toBe('#111111')

		expect(light.monacoTheme.base).toBe('vs')
		expect(dark.monacoTheme.base).toBe('vs-dark')

		// The recording indicator matches the error color by design.
		expect(light.theme.colorRec).toBe(light.theme.colorError)
		expect(light.theme.colorAffirmative).toBe(light.theme.colorSuccess)
	})
})
