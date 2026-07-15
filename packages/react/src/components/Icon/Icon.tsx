import {Icon as Iconify, type IconProps as IconifyProps} from '@iconify/react'
import {parseIcon} from '@tweeq/core'
import {type HTMLAttributes, useEffect} from 'react'

import {rememberIcon} from './iconCache'

export interface IconProps extends Omit<IconifyProps, 'icon'> {
	icon: string
}

export function Icon({icon: source, className, ...props}: IconProps) {
	const icon = parseIcon(source)

	useEffect(() => {
		if (icon.type === 'iconify') rememberIcon(icon.value)
	}, [icon.type, icon.value])

	if (icon.type === 'char') {
		return (
			<div
				{...(props as unknown as HTMLAttributes<HTMLDivElement>)}
				className={className}
				data-tq-component="icon"
				data-tq-variant="char"
			>
				{icon.value}
			</div>
		)
	}

	if (icon.type === 'fill') {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				{...props}
				className={className}
				data-tq-component="icon"
				data-tq-variant="fill"
			>
				<path fill="currentColor" d={icon.value} />
			</svg>
		)
	}

	return (
		<Iconify
			icon={icon.value}
			{...props}
			className={className}
			data-tq-component="icon"
			data-tq-variant="iconify"
		/>
	)
}
