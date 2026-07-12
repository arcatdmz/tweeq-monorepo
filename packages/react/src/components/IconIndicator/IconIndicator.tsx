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
	onKeyDown,
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
			onKeyDown={event => {
				onKeyDown?.(event)
				if (
					!event.defaultPrevented &&
					(event.key === 'Enter' || event.key === ' ')
				) {
					event.preventDefault()
					onChangeActive?.(!active)
				}
			}}
			role="button"
			tabIndex={0}
			aria-pressed={active}
			data-tq-part="root"
		>
			{icon && <Icon className={styles.icon} icon={icon} data-tq-part="icon" />}
		</div>
	)
}
