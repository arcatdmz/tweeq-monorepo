import {type SVGProps} from 'react'


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
			className={className}
			data-tq-component="svg-icon"
			data-tq-mode={mode}
			data-tq-non-stroke-scaling={nonStrokeScaling ? '' : undefined}
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
