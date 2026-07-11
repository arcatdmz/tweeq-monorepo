import {type RefObject, useCallback, useLayoutEffect, useState} from 'react'

import {useEventListener} from './useEventListener'

export interface FocusControls {
	focused: boolean
	focus(): void
	blur(): void
}

export function useFocus<T extends HTMLElement>(
	target: RefObject<T | null>
): FocusControls {
	const [focused, setFocused] = useState(false)

	useLayoutEffect(() => {
		setFocused(target.current === target.current?.ownerDocument.activeElement)
	})
	useEventListener<FocusEvent>(target, 'focus', () => setFocused(true))
	useEventListener<FocusEvent>(target, 'blur', () => setFocused(false))

	const focus = useCallback(() => target.current?.focus(), [target])
	const blur = useCallback(() => target.current?.blur(), [target])

	return {focused, focus, blur}
}
