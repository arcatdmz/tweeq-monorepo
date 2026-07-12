import type {InputBoxProps} from '@tweeq/core'
import {type ButtonHTMLAttributes} from 'react'

import {Icon} from '../Icon'

export interface InputButtonToggleProps
	extends InputBoxProps,
		Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
	value: boolean
	onChange?: (value: boolean) => void
	icon?: string
	label?: string
}

export function InputButtonToggle({
	value,
	onChange,
	icon,
	label,
	inlinePosition,
	blockPosition,
	disabled,
	invalid,
	className,
	onMouseDown,
	onClick,
	...props
}: InputButtonToggleProps) {
	return (
		<button
			{...props}
			className={className}
			inline-position={inlinePosition}
			block-position={blockPosition}
			disabled={Boolean(disabled)}
			aria-invalid={invalid || undefined}
			aria-pressed={value}
			data-tq-component="input-button-toggle"
			data-tq-part="root"
			onMouseDown={event => {
				onMouseDown?.(event)
				if (!event.defaultPrevented) event.preventDefault()
			}}
			onClick={event => {
				onClick?.(event)
				if (!event.defaultPrevented) onChange?.(!value)
			}}
		>
			{icon && <Icon icon={icon} data-tq-part="icon" />}
			{label && <span data-tq-part="label">{label}</span>}
		</button>
	)
}
