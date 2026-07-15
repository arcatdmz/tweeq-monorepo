import {type HTMLAttributes, type MouseEvent} from 'react'

import {Icon} from '../Icon'

export interface IconIndicatorProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	active?: boolean
	icon: string
	/** Shrink to `--tq-icon-size` for inline placement. */
	inline?: boolean
	/** Disable this indicator's own button behavior when nested in another widget. */
	interactive?: boolean
	onChangeActive?: (active: boolean) => void
}

export function IconIndicator({
	active,
	icon,
	inline = false,
	interactive = true,
	onChangeActive,
	onClick,
	onKeyDown,
	className,
	...props
}: IconIndicatorProps) {
	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		onClick?.(event)
		if (interactive && !event.defaultPrevented) onChangeActive?.(!active)
	}

	return (
		<div
			{...props}
			className={className}
			onClick={handleClick}
			onKeyDown={event => {
				onKeyDown?.(event)
				if (
					interactive &&
					!event.defaultPrevented &&
					(event.key === 'Enter' || event.key === ' ')
				) {
					event.preventDefault()
					onChangeActive?.(!active)
				}
			}}
			role={interactive ? 'button' : 'presentation'}
			tabIndex={interactive ? 0 : -1}
			aria-pressed={interactive ? active : undefined}
			aria-hidden={interactive ? undefined : true}
			data-tq-component="icon-indicator"
			data-inline={inline || undefined}
			data-tq-part="root"
		>
			{icon && <Icon icon={icon} data-tq-part="icon" />}
		</div>
	)
}
