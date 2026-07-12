import {describe, expect, it, vi} from 'vitest'

import {
	closeTooltip,
	getTooltipSnapshot,
	hideTooltip,
	isTooltipContentEmpty,
	parseTooltipContent,
	showTooltip,
} from './tooltip'

describe('tooltip controller', () => {
	it('normalizes plain, structured, and empty values', () => {
		expect(parseTooltipContent('Help')).toEqual({
			content: 'Help',
			html: false,
			title: '',
			description: '',
		})
		expect(
			parseTooltipContent({title: 'Title', description: 'Description'})
		).toMatchObject({title: 'Title', description: 'Description'})
		expect(isTooltipContentEmpty(parseTooltipContent(null))).toBe(true)
	})

	it('delays first show, hands off immediately, and hides the owner only', () => {
		vi.useFakeTimers()
		const first = {} as HTMLElement
		const second = {} as HTMLElement
		const content = parseTooltipContent('First')
		showTooltip(first, content, 200)
		expect(getTooltipSnapshot().open).toBe(false)
		vi.advanceTimersByTime(200)
		expect(getTooltipSnapshot()).toMatchObject({reference: first, open: true})

		showTooltip(second, parseTooltipContent('Second'), 200)
		expect(getTooltipSnapshot()).toMatchObject({reference: second, open: true})
		hideTooltip(first)
		vi.runAllTimers()
		expect(getTooltipSnapshot().open).toBe(true)
		closeTooltip(second)
		expect(getTooltipSnapshot().open).toBe(false)
		vi.useRealTimers()
	})
})
