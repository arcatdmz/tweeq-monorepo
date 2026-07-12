import {type HTMLAttributes, type ReactNode, useRef} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {type TooltipValue, useTooltip} from '../Tooltip'
import styles from './Parameter.module.styl'

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
			className={classNames('TqParameter', styles.parameter, className)}
		>
			<div ref={labelElement} className={styles.label}>
				{labelContent ?? (
					<>
						{icon && <Icon className={styles.icon} icon={icon} />}
						{label}
					</>
				)}
			</div>
			<div className={styles.input}>{children}</div>
		</li>
	)
}
