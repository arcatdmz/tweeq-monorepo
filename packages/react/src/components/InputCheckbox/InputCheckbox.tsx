import type {InputBoxProps, InputEvents} from '@tweeq/core'
import {type HTMLAttributes, useId, useRef} from 'react'

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
			data-tq-part="root"
		>
			<div
				ref={track}
				className={classNames(
					styles.checkbox,
					controls.subfocus && styles.subfocus
				)}
				block-position={blockPosition}
				inline-position={inlinePosition}
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
				<span className={styles.mark} data-tq-part="mark">
					<Icon icon={icon || 'mdi:check-bold'} />
				</span>
				<InputSwitchOverlay value={controls.tweakingValue} />
			</div>
			{label && <label htmlFor={id} data-tq-part="label">{label}</label>}
		</div>
	)
}
