import {InputBoxProps} from '../types'

// Stage V2: shared with @tweeq/core.
export type {TimeFormat} from '@tweeq/core'

export type InputTimeProps = InputBoxProps & {
	frameRate?: number
	min?: number
	max?: number
	/** Value restored by the right-click "Reset to Default" menu item. */
	default?: number
}
