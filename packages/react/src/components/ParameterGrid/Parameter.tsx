import {type HTMLAttributes, type ReactNode, useRef} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {type TooltipValue, useTooltip} from '../Tooltip'

export interface ParameterProps extends HTMLAttributes<HTMLLIElement> {
	label?: string
	icon?: string
	hint?: TooltipValue
	labelContent?: ReactNode
}

export function Parameter({
	label,
	icon,
	hint,
	labelContent,
	children,
	className,
	...props
}: ParameterProps) {
	const labelElement = useRef<HTMLDivElement>(null)
	useTooltip(labelElement, hint)
	return (
		<li
			{...props}
			className={classNames('TqParameter', className)}
			data-tq-component="parameter"
			data-tq-part="root"
		>
			<div ref={labelElement} data-tq-part="label">
				{labelContent ?? (
					<>
						{icon && <Icon data-tq-part="icon" icon={icon} />}
						{label}
					</>
				)}
			</div>
			<div data-tq-part="input">{children}</div>
		</li>
	)
}
