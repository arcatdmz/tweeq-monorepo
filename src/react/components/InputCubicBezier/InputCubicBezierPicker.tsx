import {type HTMLAttributes, useMemo, useRef} from 'react'

import {
	type CubicBezierValue,
	getCubicBezierPath,
	updateCubicBezierPoint,
} from '../../../core'
import {classNames} from '../../classNames'
import {useDrag} from '../../hooks'
import styles from './InputCubicBezierPicker.module.styl'

export interface InputCubicBezierPickerProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value: CubicBezierValue
	onChange?: (value: CubicBezierValue) => void
	onConfirm?: () => void
}

export function InputCubicBezierPicker({
	value,
	onChange,
	onConfirm,
	className,
	...props
}: InputCubicBezierPickerProps) {
	const editor = useRef<SVGSVGElement>(null)
	const draggingPoint = useRef<0 | 1 | null>(null)
	const callbacks = useRef({value, onChange, onConfirm})
	callbacks.current = {value, onChange, onConfirm}
	const dragOptions = useMemo(
		() => ({
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
		[]
	)
	useDrag(editor, dragOptions)
	const [x1, y1, x2, y2] = value

	return (
		<div {...props} className={classNames(styles.picker, className)}>
			<svg ref={editor} viewBox="0 0 1 1" className={styles.pad}>
				<g>
					<line x1={0} y1={0} x2={x1} y2={y1} />
					<line x1={1} y1={1} x2={x2} y2={y2} />
					<path d={getCubicBezierPath(value)} />
					<circle
						cx={x1}
						cy={y1}
						r=".035"
						onPointerDown={() => (draggingPoint.current = 0)}
					/>
					<circle
						cx={x2}
						cy={y2}
						r=".035"
						onPointerDown={() => (draggingPoint.current = 1)}
					/>
				</g>
			</svg>
		</div>
	)
}
