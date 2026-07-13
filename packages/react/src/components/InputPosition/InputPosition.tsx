import type {InputEvents, InputProps} from '@tweeq/core'
import {type vec2} from 'linearly'

import {InputGroup} from '../InputGroup'
import {InputTranslate} from '../InputTranslate'
import {InputVec} from '../InputVec'

export interface InputPositionProps extends InputProps, InputEvents {
	value: vec2
	onChange?: (value: vec2) => void
	min?: vec2 | number
	max?: vec2 | number
	step?: vec2 | number
}

export function InputPosition({
	value,
	onChange,
	min,
	max,
	step,
	disabled,
	invalid,
	onFocus,
	onBlur,
	onConfirm,
}: InputPositionProps) {
	return (
		<InputGroup data-tq-variant="input-position">
			<InputTranslate
				value={value}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				invalid={invalid}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
				onConfirm={onConfirm}
			/>
			<InputVec
				value={value}
				min={min}
				max={max}
				step={step}
				icon={['char:X', 'char:Y']}
				disabled={disabled}
				invalid={invalid}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
				onConfirm={onConfirm}
			/>
		</InputGroup>
	)
}
