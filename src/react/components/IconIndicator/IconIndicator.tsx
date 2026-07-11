import {type HTMLAttributes, type MouseEvent} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import styles from './IconIndicator.module.styl'

export interface IconIndicatorProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	active?: boolean
	icon: string
	/** Shrink to `--tq-icon-size` for inline placement. */
	inline?: boolean
	onChangeActive?: (active: boolean) => void
}

export function IconIndicator({
	active,
	icon,
	inline = false,
	onChangeActive,
	onClick,
	className,
	...props
}: IconIndicatorProps) {
	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		onClick?.(event)
		if (!event.defaultPrevented) onChangeActive?.(!active)
	}

	return (
		<div
			{...props}
			className={classNames(
				styles.iconIndicator,
				active === true && styles.active,
				active === false && styles.inactive,
				inline && styles.inline,
				className
			)}
			onClick={handleClick}
		>
			{icon && <Icon className={styles.icon} icon={icon} />}
		</div>
	)
}
