import {type HTMLAttributes, useId, useRef} from 'react'

import {type InputBoxProps, type InputEvents} from '../../../core'
import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {InputSwitchOverlay, useInputSwitch} from '../InputSwitch'
import styles from './InputCheckbox.module.styl'

export interface InputCheckboxProps
	extends InputBoxProps,
		InputEvents,
		Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: boolean
	onChange?: (value: boolean) => void
	label?: string
	icon?: string
}

export function InputCheckbox({
	value,
	onChange,
	label,
	icon,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputCheckboxProps) {
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
			className={classNames(
				styles.tqInputCheckbox,
				disabled && styles.disabled,
				className
			)}
			aria-invalid={invalid || undefined}
		>
			<div
				ref={track}
				className={classNames(
					styles.checkbox,
					controls.subfocus && styles.subfocus
				)}
				block-position={blockPosition}
				inline-position={inlinePosition}
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
				<Icon icon={icon || 'mdi:check-bold'} className={styles.mark} />
				<InputSwitchOverlay value={controls.tweakingValue} />
			</div>
			{label && <label htmlFor={id}>{label}</label>}
		</div>
	)
}
