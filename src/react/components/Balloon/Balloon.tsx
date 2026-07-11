import {type HTMLAttributes, useMemo, useRef} from 'react'

import {type BalloonArrowSide, getBalloonGeometry} from '../../../core'
import {classNames} from '../../classNames'
import {useElementBounding} from '../../hooks'
import styles from './Balloon.module.styl'

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
			className={classNames(styles.tqBalloon, flash && styles.flash, className)}
			data-tq-balloon=""
			style={{
				...style,
				...geometry.wrapperPadding,
				transformOrigin: geometry.transformOrigin,
			}}
		>
			<div
				className={styles.fill}
				style={{
					clipPath: geometry.path ? `path('${geometry.path}')` : undefined,
				}}
			/>
			<svg
				className={styles.stroke}
				viewBox={`0 0 ${geometry.layerWidth} ${geometry.layerHeight}`}
				width={geometry.layerWidth}
				height={geometry.layerHeight}
			>
				<path d={geometry.path} />
			</svg>
			<div ref={content} className={styles.content} style={{padding}}>
				{children}
			</div>
		</div>
	)
}
