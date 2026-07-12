import {describe, expect, it} from 'vitest'

import {normalizeTabId, resolveActiveTabId} from './tabs'

describe('tabs selection', () => {
	it('prefers current, persisted, default, then the first enabled tab', () => {
		const tabs = [
			{id: 'disabled', isDisabled: true},
			{id: 'first'},
			{id: 'saved'},
		]
		expect(resolveActiveTabId(tabs, 'first', 'saved')).toBe('first')
		expect(resolveActiveTabId(tabs, null, 'saved')).toBe('saved')
		expect(resolveActiveTabId(tabs, null, null, 'first')).toBe('first')
		expect(resolveActiveTabId(tabs, null, 'disabled', 'disabled')).toBe('first')
		expect(resolveActiveTabId([{id: 'disabled', isDisabled: true}])).toBe('')
	})

	it('derives stable fallback ids from labels', () => {
		expect(normalizeTabId('Color Settings')).toBe('color-settings')
	})
})
