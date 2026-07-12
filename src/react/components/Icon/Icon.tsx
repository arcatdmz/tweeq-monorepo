import {Icon as Iconify, type IconProps as IconifyProps} from '@iconify/react'
import {type HTMLAttributes, useEffect} from 'react'

import {classNames} from '../../classNames'
import styles from './Icon.module.styl'
import {rememberIcon} from './iconCache'

export interface IconProps extends Omit<IconifyProps, 'icon'> {
	icon: string
}

type ParsedIcon =
	| {type: 'char'; value: string}
	| {type: 'fill'; value: string}
	| {type: 'iconify'; value: string}

function parseIcon(icon: string): ParsedIcon {
	if (icon.startsWith('char:')) return {type: 'char', value: icon.slice(5)}
	if (icon.startsWith('fill:')) return {type: 'fill', value: icon.slice(5)}
	return {type: 'iconify', value: icon}
}

export function Icon({icon: source, className, ...props}: IconProps) {
	const icon = parseIcon(source)

	useEffect(() => {
		if (icon.type === 'iconify') rememberIcon(icon.value)
	}, [icon.type, icon.value])

	const rootClassName = classNames(
		styles.tqIcon,
		icon.type === 'iconify' && styles.iconify,
		icon.type === 'char' && styles.char,
		icon.type === 'fill' && styles.fill,
		className
	)

	if (icon.type === 'char') {
		return (
			<div
				{...(props as unknown as HTMLAttributes<HTMLDivElement>)}
				className={rootClassName}
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
				className={rootClassName}
			>
				<path fill="currentColor" d={icon.value} />
			</svg>
		)
	}

	return <Iconify icon={icon.value} {...props} className={rootClassName} />
}
