import {type HTMLAttributes, useId, useRef} from 'react'

import {type InputBoxProps, type InputEvents} from '../../../core'
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
		>
			<div
				ref={track}
				className={classNames(
					styles.track,
					controls.subfocus && styles.subfocus
				)}
				inline-position={inlinePosition}
				block-position={blockPosition}
			>
				<input
					id={id}
					ref={input}
					checked={value}
					disabled={disabled}
					className={styles.input}
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
				/>
			</div>
			{label && <label htmlFor={id}>{label}</label>}
		</div>
	)
}
