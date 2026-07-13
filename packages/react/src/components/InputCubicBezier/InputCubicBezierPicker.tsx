import {
	type CubicBezierValue,
	getCubicBezierPath,
	updateCubicBezierPoint,
} from '@tweeq/core'
import {type HTMLAttributes, useMemo, useRef} from 'react'

import {useDrag} from '../../hooks'

export interface InputCubicBezierPickerProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value: CubicBezierValue
	onChange?: (value: CubicBezierValue) => void
	onConfirm?: () => void
	disabled?: boolean
}

export function InputCubicBezierPicker({
	value,
	onChange,
	onConfirm,
	disabled,
	className,
	...props
}: InputCubicBezierPickerProps) {
	const editor = useRef<SVGSVGElement>(null)
	const draggingPoint = useRef<0 | 1 | null>(null)
	const callbacks = useRef({value, onChange, onConfirm})
	callbacks.current = {value, onChange, onConfirm}
	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(disabled),
			dragDelaySeconds: 0,
			onDrag: ({
				xy,
				left,
				right,
				top,
				bottom,
			}: {
				xy: readonly [number, number]
				left: number
				right: number
				top: number
				bottom: number
			}) => {
				const point = draggingPoint.current
				if (point === null) return
				const x = (xy[0] - left) / (right - left)
				const y = (bottom - xy[1]) / (bottom - top)
				callbacks.current.onChange?.(
					updateCubicBezierPoint(callbacks.current.value, point, x, y)
				)
			},
			onDragEnd: () => {
				draggingPoint.current = null
				callbacks.current.onConfirm?.()
			},
		}),
		[disabled]
	)
	useDrag(editor, dragOptions)
	const [x1, y1, x2, y2] = value

	return (
		<div
			{...props}
			className={className}
			data-tq-component="input-cubic-bezier-picker"
			data-tq-part="picker"
		>
			<svg
				ref={editor}
				viewBox="0 0 1 1"
				data-tq-part="pad"
			>
				<g>
					<line x1={0} y1={0} x2={x1} y2={y1} />
					<line x1={1} y1={1} x2={x2} y2={y2} />
					<path d={getCubicBezierPath(value)} />
					<circle
						cx={x1}
						cy={y1}
						r=".035"
						onPointerDown={() => (draggingPoint.current = 0)}
						data-tq-part="handle-0"
					/>
					<circle
						cx={x2}
						cy={y2}
						r=".035"
						onPointerDown={() => (draggingPoint.current = 1)}
						data-tq-part="handle-1"
					/>
				</g>
			</svg>
		</div>
	)
}
