import {type BalloonArrowSide, getBalloonGeometry} from '@tweeq/core'
import {type HTMLAttributes, useMemo, useRef} from 'react'

import {useElementBounding} from '../../hooks'

export interface BalloonProps extends HTMLAttributes<HTMLDivElement> {
	arrowSide?: BalloonArrowSide | null
	arrowOffset?: number
	radius?: number
	padding?: string
	flash?: boolean
}

export function Balloon({
	arrowSide = null,
	arrowOffset = 0,
	radius = 13,
	padding = 'var(--tq-popup-padding)',
	flash = false,
	className,
	style,
	children,
	...props
}: BalloonProps) {
	const content = useRef<HTMLDivElement>(null)
	const {width, height} = useElementBounding(content)
	const geometry = useMemo(
		() =>
			getBalloonGeometry(width, height, {
				arrowSide,
				arrowOffset,
				radius,
			}),
		[arrowOffset, arrowSide, height, radius, width]
	)

	return (
		<div
			{...props}
			className={className}
			data-tq-component="balloon"
			data-tq-balloon=""
			data-tq-flash={flash ? '' : undefined}
			style={{
				...style,
				...geometry.wrapperPadding,
				transformOrigin: geometry.transformOrigin,
			}}
		>
			<div
				data-tq-part="fill"
				style={{
					clipPath: geometry.path ? `path('${geometry.path}')` : undefined,
				}}
			/>
			<svg
				data-tq-part="stroke"
				viewBox={`0 0 ${geometry.layerWidth} ${geometry.layerHeight}`}
				width={geometry.layerWidth}
				height={geometry.layerHeight}
			>
				<path d={geometry.path} />
			</svg>
			<div ref={content} data-tq-part="content" style={{padding}}>
				{children}
			</div>
		</div>
	)
}
