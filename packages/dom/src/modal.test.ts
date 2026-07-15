import {describe, expect, it} from 'vitest'

import {isMultilineEditorTarget} from './modal'

describe('modal keyboard target ownership', () => {
	it('recognizes textarea, contenteditable, and Monaco descendants', () => {
		const target = (overrides: Record<string, unknown>) =>
			({
				tagName: 'INPUT',
				isContentEditable: false,
				closest: () => null,
				...overrides,
			}) as unknown as EventTarget
		expect(isMultilineEditorTarget(target({tagName: 'TEXTAREA'}))).toBe(true)
		expect(isMultilineEditorTarget(target({isContentEditable: true}))).toBe(true)
		expect(isMultilineEditorTarget(target({closest: () => ({})}))).toBe(true)
		expect(isMultilineEditorTarget(target({}))).toBe(false)
	})
})
