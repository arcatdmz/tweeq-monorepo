import {type vec2} from 'linearly'
import {type RefObject, useMemo} from 'react'

import {useElementBounding} from './useElementBounding'

export function useElementCenter<T extends Element>(
	target: RefObject<T | null>
): vec2 {
	const {left, top, right, bottom} = useElementBounding(target)

	return useMemo(
		() => [(left + right) / 2, (top + bottom) / 2],
		[bottom, left, right, top]
	)
}
