export interface CodeEditorErrorInfo {
	message: string
	line: number
	column: number
}

export interface CodeEditorMarker {
	message: string
	severity: number
	startLineNumber: number
	endLineNumber: number
	startColumn: number
	endColumn: number
}

export function createCodeEditorMarkers(
	errors: readonly CodeEditorErrorInfo[] | null | undefined,
	severity: number
): CodeEditorMarker[] {
	return (errors ?? []).map(error => ({
		message: error.message,
		severity,
		startLineNumber: error.line,
		endLineNumber: error.line,
		startColumn: error.column,
		endColumn: error.column,
	}))
}
