import {
	type ButtonHTMLAttributes,
	forwardRef,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import {useFlash, useResizeObserver} from '../../hooks'
import {Icon} from '../Icon'
import {useTooltip} from '../Tooltip'

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
				className={className}
				inline-position={inlinePosition}
				block-position={blockPosition}
				aria-invalid={invalid || undefined}
				data-tq-component="input-button"
				data-blink={blink || undefined}
				data-subtle={subtle || undefined}
				data-narrow={narrow || undefined}
				data-flashing={flashing || undefined}
				data-tq-part="root"
				onMouseDown={event => {
					onMouseDown?.(event)
					if (!event.defaultPrevented) event.preventDefault()
				}}
			>
				{icon && <Icon icon={icon} data-tq-part="icon" />}
				{label && (
					<span ref={labelElement} data-tq-part="label">
						{label}
					</span>
				)}
				{chevron && (
					<span data-tq-part="chevron">
						<Icon icon="mdi:chevron-down" />
					</span>
				)}
			</button>
		)
	}
)
