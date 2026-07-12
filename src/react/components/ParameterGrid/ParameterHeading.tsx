import {type HTMLAttributes, type ReactNode} from 'react'

import {classNames} from '../../classNames'
import styles from './ParameterHeading.module.styl'

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
			className={classNames('TqParameterHeading', styles.headingRow, className)}
		>
			<div className={styles.heading}>{children}</div>
			<div>{right}</div>
		</li>
	)
}
