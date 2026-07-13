import {vec2} from 'linearly'

import {InputBoxProps} from '../types'

export type InputPositionProps = InputBoxProps & {
	min?: vec2 | number
	max?: vec2 | number
	step?: vec2 | number
}
