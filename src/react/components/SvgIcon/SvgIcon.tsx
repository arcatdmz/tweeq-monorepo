import {type SVGProps} from 'react'

import {classNames} from '../../classNames'
import styles from './SvgIcon.module.styl'

export interface SvgIconProps
	extends Omit<SVGProps<SVGSVGElement>, 'strokeWidth'> {
	mode?: 'inline' | 'block'
	strokeWidth?: number
	nonStrokeScaling?: boolean
}

export function SvgIcon({
	mode = 'inline',
	strokeWidth,
	nonStrokeScaling = false,
	className,
	children,
	style,
	...props
}: SvgIconProps) {
	return (
		<svg
			className={classNames(
				styles.tqSvgIcon,
				mode === 'inline' && styles.inline,
				mode === 'block' && styles.block,
				nonStrokeScaling && styles.nonStrokeScaling,
				className
			)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			width="32"
			height="32"
			style={{...style, strokeWidth}}
			{...props}
		>
			{children}
		</svg>
	)
}
