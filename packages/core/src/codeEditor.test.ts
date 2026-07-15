import {describe, expect, it} from 'vitest'

import {createCodeEditorMarkers} from './codeEditor'

describe('code editor diagnostics', () => {
	it('maps public errors to editor markers and clears null diagnostics', () => {
		expect(
			createCodeEditorMarkers([{message: 'Expected ;', line: 2, column: 4}], 8)
		).toEqual([
			{
				message: 'Expected ;',
				severity: 8,
				startLineNumber: 2,
				endLineNumber: 2,
				startColumn: 4,
				endColumn: 4,
			},
		])
		expect(createCodeEditorMarkers(null, 8)).toEqual([])
	})
})
