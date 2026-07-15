import {describe, expect, it} from 'vitest'

import {moveTabSelection, normalizeTabId, resolveActiveTabId} from './tabs'

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

	it('moves through enabled tabs with orientation-aware wrapping', () => {
		const tabs = [
			{id: 'first'},
			{id: 'disabled', isDisabled: true},
			{id: 'last'},
		]
		expect(
			moveTabSelection({
				tabs,
				currentId: 'first',
				key: 'ArrowRight',
				vertical: false,
			})
		).toBe('last')
		expect(
			moveTabSelection({
				tabs,
				currentId: 'last',
				key: 'ArrowRight',
				vertical: false,
			})
		).toBe('first')
		expect(
			moveTabSelection({
				tabs,
				currentId: 'first',
				key: 'ArrowDown',
				vertical: false,
			})
		).toBeUndefined()
		expect(
			moveTabSelection({
				tabs,
				currentId: 'last',
				key: 'Home',
				vertical: true,
			})
		).toBe('first')
	})
})
