import type {InputBoxProps, InputEvents} from '@tweeq/core'
import {type HTMLAttributes, useId, useRef} from 'react'

import {classNames} from '../../classNames'
import styles from './InputSwitch.module.styl'
import {useInputSwitch} from './useInputSwitch'

export interface InputSwitchProps
	extends InputBoxProps,
		InputEvents,
		Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: boolean
	onChange?: (value: boolean) => void
	label?: string
}

export function InputSwitch({
	value,
	onChange,
	label,
	disabled,
	invalid,
	onFocus,
	onBlur,
	onConfirm,
	inlinePosition,
	blockPosition,
	className,
	...props
}: InputSwitchProps) {
	const id = useId()
	const track = useRef<HTMLDivElement>(null)
	const input = useRef<HTMLInputElement>(null)
	const controls = useInputSwitch({
		track,
		input,
		value,
		onChange,
		disabled,
		onFocus,
		onBlur,
		onConfirm,
	})

	return (
		<div
			{...props}
			className={classNames(styles.tqInputSwitch, className)}
			aria-invalid={invalid || undefined}
			data-tq-part="root"
		>
			<div
				ref={track}
				className={classNames(
					styles.track,
					controls.subfocus && styles.subfocus
				)}
				inline-position={inlinePosition}
				block-position={blockPosition}
				data-tq-part="track"
			>
				<input
					id={id}
					ref={input}
					checked={value}
					disabled={disabled}
					className={styles.input}
					data-tq-part="input"
					type="checkbox"
					onChange={controls.onChangeInput}
					onKeyDown={controls.onKeyDown}
					onFocus={controls.onFocusInput}
					onBlur={controls.onBlurInput}
				/>
				<div
					className={classNames(
						styles.handle,
						controls.tweakingValue !== null && styles.tweaking
					)}
					data-tq-part="handle"
				/>
			</div>
			{label && <label htmlFor={id} data-tq-part="label">{label}</label>}
		</div>
	)
}
