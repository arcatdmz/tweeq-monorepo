import {bindZuiGestures} from '@tweeq/dom'
import {type mat2d} from 'linearly'
import {type Ref} from 'vue'

import {useBndr} from './useBndr'

export function useZUI(
	element: Ref<HTMLElement | null>,
	onTransform: (delta: mat2d) => void
) {
	useBndr(element, element => {
		bindZuiGestures(element, onTransform)
	})
}
