import type {Validator} from '@tweeq/core/validator'

import {
	type InputAlign,
	type InputBoxProps,
	type InputFont,
	type InputTheme,
} from '../types'
export interface InputStringProps extends InputBoxProps {
	theme?: InputTheme
	font?: InputFont
	align?: InputAlign
	validator?: Validator<string>
	/** Value restored by the right-click "Reset to Default" menu item. */
	default?: string
}
