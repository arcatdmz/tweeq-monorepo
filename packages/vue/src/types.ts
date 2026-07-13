import {getLabelizer} from '@tweeq/core'
import {computed} from 'vue'

export type Labelizer<T> = (v: T) => string

export type InputTheme = 'minimal' | 'underline'

export type InputFont = 'numeric' | 'monospace'

export type InputAlign = 'left' | 'center' | 'right'

export type InputPosition = 'start' | 'middle' | 'end'

export interface InputProps {
	invalid?: boolean
	disabled?: boolean
}

export interface InputEmits {
	focus: []
	blur: []
	confirm: []
}

export interface InputBoxProps extends InputProps {
	inlinePosition?: InputPosition
	blockPosition?: InputPosition
}

export interface LabelizerProps<T> {
	readonly options: T[]
	readonly labels?: string[]
	labelizer?: Labelizer<T>
	prefix?: string
	suffix?: string
}

export function useLabelizer<T>(props: LabelizerProps<T>) {
	return computed(() => getLabelizer(props))
}
