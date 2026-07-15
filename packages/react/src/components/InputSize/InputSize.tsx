import {
	type InputEvents,
	type InputProps,
	updateSizeWithRatio,
} from '@tweeq/core'
import {type vec2} from 'linearly'
import {useRef, useState} from 'react'

import {Icon} from '../Icon'
import {InputVec} from '../InputVec'

export interface InputSizeProps extends InputProps, InputEvents {
	value: vec2
	onChange?: (value: vec2) => void
}

export function InputSize({
	value,
	onChange,
	disabled,
	invalid,
	onFocus,
	onBlur,
	onConfirm,
}: InputSizeProps) {
	const [keepRatio, setKeepRatio] = useState(true)
	const valueOnEdit = useRef(value)

	return (
		<div data-tq-component="input-size" data-tq-part="root">
			<InputVec
				value={value}
				icon={['mdi:arrow-left-right', 'mdi:arrow-up-down']}
				disabled={disabled}
				invalid={invalid}
				onChange={next => {
					const result = updateSizeWithRatio({
						previous: value,
						next,
						valueOnEdit: valueOnEdit.current,
						keepRatio,
					})
					setKeepRatio(result.keepRatio)
					onChange?.(result.value)
				}}
				onFocus={() => {
					valueOnEdit.current = value
					onFocus?.()
				}}
				onBlur={onBlur}
				onConfirm={onConfirm}
			/>
			<button
				type="button"
				disabled={disabled}
				aria-pressed={keepRatio}
				data-tq-part="ratio"
				onClick={() => setKeepRatio(current => !current)}
			>
				<Icon
					data-tq-part="ratio-icon"
					icon={keepRatio ? 'radix-icons:link-1' : 'radix-icons:link-none-1'}
				/>
			</button>
		</div>
	)
}
