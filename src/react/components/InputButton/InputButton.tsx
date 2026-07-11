import {
	type ButtonHTMLAttributes,
	forwardRef,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import {classNames} from '../../classNames'
import {useFlash, useResizeObserver} from '../../hooks'
import {Icon} from '../Icon'
import {useTooltip} from '../Tooltip'
import styles from './InputButton.module.styl'

export interface InputButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
	inlinePosition?: 'start' | 'middle' | 'end'
	blockPosition?: 'start' | 'middle' | 'end'
	invalid?: boolean
	icon?: string
	label?: string
	chevron?: boolean
	tooltip?: string
	blink?: boolean
	subtle?: boolean
	narrow?: boolean
}

export interface InputButtonHandle {
	flash(): void
	getElement(): HTMLButtonElement | null
}

export const InputButton = forwardRef<InputButtonHandle, InputButtonProps>(
	function InputButtonComponent(
		{
			inlinePosition,
			blockPosition,
			invalid,
			icon,
			label,
			chevron = false,
			tooltip,
			blink = false,
			subtle = false,
			narrow = false,
			className,
			onMouseDown,
			...props
		},
		forwardedRef
	) {
		const button = useRef<HTMLButtonElement>(null)
		const labelElement = useRef<HTMLSpanElement>(null)
		const [truncated, setTruncated] = useState(false)
		const {flashing, flash} = useFlash()
		const measure = () => {
			const element = labelElement.current
			setTruncated(
				Boolean(element && element.scrollWidth > element.clientWidth + 0.5)
			)
		}

		useResizeObserver(labelElement, measure)
		useLayoutEffect(measure, [label])
		useTooltip(button, tooltip ?? (truncated ? label : undefined))
		useImperativeHandle(
			forwardedRef,
			() => ({flash, getElement: () => button.current}),
			[flash]
		)

		return (
			<button
				{...props}
				ref={button}
				className={classNames(
					styles.tqInputButton,
					blink && styles.blink,
					subtle && styles.subtle,
					narrow && styles.narrow,
					flashing && styles.flashing,
					className
				)}
				inline-position={inlinePosition}
				block-position={blockPosition}
				aria-invalid={invalid || undefined}
				onMouseDown={event => {
					onMouseDown?.(event)
					if (!event.defaultPrevented) event.preventDefault()
				}}
			>
				{icon && <Icon className={styles.icon} icon={icon} />}
				{label && (
					<span ref={labelElement} className={styles.label}>
						{label}
					</span>
				)}
				{chevron && (
					<span className={styles.chevron}>
						<Icon icon="mdi:chevron-down" />
					</span>
				)}
			</button>
		)
	}
)
