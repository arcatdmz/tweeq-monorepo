import type {InputEvents, InputProps} from '@tweeq/core'

import {InputGroup} from '../InputGroup'
import {InputNumber} from '../InputNumber'

export interface InputVecProps<T extends readonly number[]>
	extends InputProps,
		InputEvents {
	value: T
	onChange?: (value: T) => void
	min?: T | number
	max?: T | number
	step?: T | number
	icon?: string[] | string
}

function valueAt<T extends readonly number[]>(
	value: T | number | undefined,
	index: number
): number | undefined {
	return Array.isArray(value) ? value[index] : (value as number | undefined)
}

export function InputVec<T extends readonly number[]>({
	value,
	onChange,
	min,
	max,
	step,
	icon,
	disabled,
	invalid,
	onFocus,
	onBlur,
	onConfirm,
}: InputVecProps<T>) {
	let pending: number[] | undefined
	let confirmPending = false

	const commitChange = (index: number, next: number) => {
		if (!pending) {
			pending = [...value]
			queueMicrotask(() => {
				if (pending) onChange?.(pending as unknown as T)
				pending = undefined
			})
		}
		pending[index] = next
	}
	const commitConfirm = () => {
		if (confirmPending) return
		confirmPending = true
		queueMicrotask(() => {
			confirmPending = false
			onConfirm?.()
		})
	}

	return (
		<InputGroup>
			{value.map((entry, index) => (
				<InputNumber
					key={index}
					data-tq-vector-index={index}
					value={entry}
					min={valueAt(min, index)}
					max={valueAt(max, index)}
					step={valueAt(step, index)}
					leftIcon={Array.isArray(icon) ? icon[index] : icon}
					inlinePosition={
						index === 0 ? 'start' : index === value.length - 1 ? 'end' : 'middle'
					}
					disabled={disabled}
					invalid={invalid}
					onChange={next => commitChange(index, next)}
					onFocus={onFocus}
					onBlur={onBlur}
					onConfirm={commitConfirm}
				/>
			))}
		</InputGroup>
	)
}
