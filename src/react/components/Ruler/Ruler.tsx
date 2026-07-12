import * as Bndr from 'bndr-js'
import {scalar, type vec2} from 'linearly'
import {type HTMLAttributes, type ReactNode, useRef} from 'react'

import {classNames} from '../../classNames'
import {useBndr, useElementBounding} from '../../hooks'
import styles from './Ruler.module.styl'

export interface RulerScale {
	value: number
	label?: string
	opacity?: number
}

export interface RulerProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag'> {
	range: vec2
	scales?: RulerScale[]
	onDrag?: (value: number) => void
	children?: ReactNode
}

export function Ruler({
	range,
	scales,
	onDrag,
	children,
	className,
	...props
}: RulerProps) {
	const root = useRef<HTMLDivElement>(null)
	const {width} = useElementBounding(root)
	const pixelsPerUnit = width / (range[1] - range[0])
	const renderedScales: RulerScale[] =
		scales ??
		Array.from(
			{length: Math.max(0, Math.floor(range[1]) - Math.ceil(range[0]) + 1)},
			(_, index) => ({value: Math.ceil(range[0]) + index})
		)

	useBndr(
		root,
		element => {
			Bndr.pointer(element)
				.drag({pointerCapture: true, coordinate: 'offset'})
				.on(drag => {
					onDrag?.(scalar.fit(drag.current[0], 0, width, ...range))
				})
		},
		[onDrag, range[0], range[1], width]
	)

	return (
		<div
			{...props}
			ref={root}
			className={classNames(styles.tqRuler, className)}
			style={{
				backgroundSize: `${pixelsPerUnit}px 100%`,
				backgroundPosition: `${-range[0] * pixelsPerUnit}px 0`,
			}}
		>
			<div className={styles.content}>{children}</div>
			{renderedScales.map(scale => (
				<div
					key={scale.value}
					className={styles.scale}
					style={{
						transform: `translateX(${(scale.value - range[0]) * pixelsPerUnit}px)`,
						opacity: scale.opacity ?? 1,
					}}
				>
					{scale.label ?? scale.value}
				</div>
			))}
		</div>
	)
}
