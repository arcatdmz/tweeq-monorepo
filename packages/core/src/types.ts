import Case from 'case'

export type Labelizer<T> = (v: T) => string

export type InputTheme = 'minimal' | 'underline'

export type InputFont = 'numeric' | 'monospace'

export type InputAlign = 'left' | 'center' | 'right'

export type InputPosition = 'start' | 'middle' | 'end'

export interface InputProps {
	invalid?: boolean
	disabled?: boolean
}

/**
 * Framework-neutral replacement for the legacy Vue `InputEmits`
 * (`focus` / `blur` / `confirm` events). React components take these as
 * optional callbacks; `onConfirm` keeps the legacy semantics (commit at the
 * end of a gesture/edit).
 */
export interface InputEvents {
	onFocus?: () => void
	onBlur?: () => void
	onConfirm?: () => void
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

/**
 * Pure version of the legacy `useLabelizer` composable (the Vue `computed`
 * wrapper is dropped; call it during render or memoize it in the adapter).
 */
export function getLabelizer<T>(props: LabelizerProps<T>): Labelizer<T> {
	if (props.labelizer) return props.labelizer

	const prefix = props.prefix || ''
	const suffix = props.suffix || ''

	if (!props.labels) {
		return (v: T) => prefix + Case.capital(String(v)) + suffix
	}

	const labels = props.labels

	if (labels.length !== props.options.length) {
		throw new Error(
			'the length of labels must be the same as the length of options'
		)
	}

	return (v: T) => {
		const index = props.options.indexOf(v)
		return prefix + labels[index] + suffix
	}
}

// Color value types (copied from the legacy src/InputColor/types.ts so the
// multiSelect store — and later the React InputColor — can stay
// framework-free).
export type RGB = {r: number; g: number; b: number}
export type RGBA = [r: number, g: number, b: number, a: number]
export type HSV = {h: number; s: number; v: number}
export type HSVA = {h: number; s: number; v: number; a: number}
