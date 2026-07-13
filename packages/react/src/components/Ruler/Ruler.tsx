import {
	getRulerDefaultScales,
	getRulerPixelsPerUnit,
	getRulerScaleOffset,
	getRulerValueAtPixel,
	type RulerScale,
} from '@tweeq/core'
import * as Bndr from 'bndr-js'
import {type vec2} from 'linearly'
import {type HTMLAttributes, type ReactNode, useRef} from 'react'

import {classNames} from '../../classNames'
import {useBndr, useElementBounding} from '../../hooks'

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
	const pixelsPerUnit = getRulerPixelsPerUnit(width, range)
	const renderedScales = scales ?? getRulerDefaultScales(range)

	useBndr(
		root,
		element => {
			Bndr.pointer(element)
				.drag({pointerCapture: true, coordinate: 'offset'})
				.on(drag => {
					onDrag?.(getRulerValueAtPixel(drag.current[0], width, range))
				})
		},
		[onDrag, range[0], range[1], width]
	)

	return (
		<div
			{...props}
			ref={root}
			className={classNames('TqRuler', className)}
			style={{
				backgroundSize: `${pixelsPerUnit}px 100%`,
				backgroundPosition: `${-range[0] * pixelsPerUnit}px 0`,
			}}
			data-tq-component="ruler"
			data-tq-part="root"
		>
			<div data-tq-part="content">{children}</div>
			{renderedScales.map(scale => (
				<div
					key={scale.value}
					style={{
						transform: `translateX(${getRulerScaleOffset(scale.value, range, pixelsPerUnit)}px)`,
						opacity: scale.opacity ?? 1,
					}}
					data-tq-part="scale"
				>
					{scale.label ?? scale.value}
				</div>
			))}
		</div>
	)
}
