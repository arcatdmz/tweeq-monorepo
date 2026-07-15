import {
	type CubicBezierValue,
	getCubicBezierPath,
	type InputBoxProps,
	type InputEvents,
} from '@tweeq/core'
import {type ButtonHTMLAttributes, type CSSProperties, useState} from 'react'

import {Popover} from '../Popover'
import {InputCubicBezierPicker} from './InputCubicBezierPicker'

export interface InputCubicBezierProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			ButtonHTMLAttributes<HTMLButtonElement>,
			'onBlur' | 'onChange' | 'onFocus' | 'value'
		> {
	value: CubicBezierValue
	onChange?: (value: CubicBezierValue) => void
}

export function InputCubicBezier({
	value,
	onChange,
	onConfirm,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	className,
	...props
}: InputCubicBezierProps) {
	const [button, setButton] = useState<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	return (
		<>
			<button
				{...props}
				ref={setButton}
				type={props.type ?? 'button'}
				disabled={disabled}
				aria-invalid={invalid || undefined}
				aria-expanded={open}
				className={className}
				data-inline-position={inlinePosition}
				data-block-position={blockPosition}
				data-tq-component="input-cubic-bezier"
				data-tq-open={open ? '' : undefined}
				data-tq-part="root"
				onClick={() => setOpen(true)}
			>
				<svg
					viewBox="0 0 1 1"
					aria-hidden="true"
					data-tq-part="icon"
				>
					<path d={getCubicBezierPath(value)} data-tq-part="path" />
				</svg>
			</button>
			<Popover open={open} reference={button} onChangeOpen={setOpen}>
				<div
					data-tq-component="input-cubic-bezier-floating"
					data-tq-part="floating"
				>
					<InputCubicBezierPicker
						value={value}
						onChange={onChange}
						onConfirm={onConfirm}
						disabled={disabled}
					/>
				</div>
			</Popover>
		</>
	)
}

export function cubicBezierStyle(value: CubicBezierValue): CSSProperties {
	return {transitionTimingFunction: `cubic-bezier(${value.join(',')})`}
}
