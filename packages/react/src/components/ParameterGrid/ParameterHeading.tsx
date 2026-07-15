import {type HTMLAttributes, type ReactNode} from 'react'

import {classNames} from '../../classNames'

export interface ParameterHeadingProps extends HTMLAttributes<HTMLLIElement> {
	right?: ReactNode
}

export function ParameterHeading({
	right,
	children,
	className,
	...props
}: ParameterHeadingProps) {
	return (
		<li
			{...props}
			className={classNames('TqParameterHeading', className)}
			data-tq-component="parameter-heading"
			data-tq-part="root"
		>
			<div data-tq-part="heading">{children}</div>
			<div data-tq-part="right">{right}</div>
		</li>
	)
}
