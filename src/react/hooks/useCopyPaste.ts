import {type RefObject} from 'react'

import {useEventListener} from './useEventListener'

export interface CopyPasteOptions<T extends HTMLElement = HTMLElement> {
	target: RefObject<T | null>
	onCopy?: () => void
	onPaste?: () => void
}

/** Invoke copy/paste callbacks while the target itself has focus. */
export function useCopyPaste<T extends HTMLElement>({
	target,
	onCopy,
	onPaste,
}: CopyPasteOptions<T>): void {
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			if (!event.metaKey && !event.ctrlKey) return
			if (target.current?.ownerDocument.activeElement !== target.current) return

			if (event.key.toLowerCase() === 'c') onCopy?.()
			if (event.key.toLowerCase() === 'v') onPaste?.()
		}
	)
}
