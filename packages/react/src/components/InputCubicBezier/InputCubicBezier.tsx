import {
	type CubicBezierValue,
	getCubicBezierPath,
	type InputBoxProps,
	type InputEvents,
} from '@tweeq/core'
import {type ButtonHTMLAttributes, type CSSProperties, useState} from 'react'

import {classNames} from '../../classNames'
import {Popover} from '../Popover'
import styles from './InputCubicBezier.module.styl'
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
				className={classNames(
					styles.inputCubicBezier,
					open && styles.open,
					className
				)}
				data-inline-position={inlinePosition}
				data-block-position={blockPosition}
				onClick={() => setOpen(true)}
			>
				<svg className={styles.icon} viewBox="0 0 1 1" aria-hidden="true">
					<path d={getCubicBezierPath(value)} />
				</svg>
			</button>
			<Popover open={open} reference={button} onChangeOpen={setOpen}>
				<div className={styles.floating}>
					<InputCubicBezierPicker
						value={value}
						onChange={onChange}
						onConfirm={onConfirm}
					/>
				</div>
			</Popover>
		</>
	)
}

export function cubicBezierStyle(value: CubicBezierValue): CSSProperties {
	return {transitionTimingFunction: `cubic-bezier(${value.join(',')})`}
}
