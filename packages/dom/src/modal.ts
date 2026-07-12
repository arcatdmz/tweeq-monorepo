export function isMultilineEditorTarget(target: EventTarget | null): boolean {
	const element = target as HTMLElement | null
	return Boolean(
		element &&
			(element.tagName === 'TEXTAREA' ||
				element.isContentEditable ||
				element.closest?.('.monaco-editor'))
	)
}
