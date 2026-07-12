import {
	decomposeVec2,
	getTranslateOverlayGeometry,
	type InputBoxProps,
	type InputEvents,
	precisionOf,
} from '@tweeq/core'
import type {DragState} from '@tweeq/dom'
import {type vec2} from 'linearly'
import {
	type ButtonHTMLAttributes,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import {useDrag, useKeys} from '../../hooks'
import {Icon} from '../Icon'
import {Tooltip} from '../Tooltip'
import styles from './InputTranslate.module.styl'

const TRANSLATE_KEYS = ['Shift', 'Alt', 'x', 'y'] as const

export interface InputTranslateProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			ButtonHTMLAttributes<HTMLButtonElement>,
			'onBlur' | 'onChange' | 'onFocus' | 'value'
		> {
	value: vec2
	onChange?: (value: vec2) => void
	min?: vec2 | number
	max?: vec2 | number
	step?: vec2 | number
	showOverlayLabel?: boolean
}

export function InputTranslate({
	value,
	onChange,
	min: minProp,
	max: maxProp,
	showOverlayLabel = true,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	...props
}: InputTranslateProps) {
	const button = useRef<HTMLButtonElement>(null)
	const keys = useKeys(TRANSLATE_KEYS)
	const keysRef = useRef(keys)
	keysRef.current = keys
	const valueRef = useRef(value)
	valueRef.current = value
	const callbacksRef = useRef({onChange, onFocus, onBlur, onConfirm, disabled})
	callbacksRef.current = {onChange, onFocus, onBlur, onConfirm, disabled}
	const min = decomposeVec2(minProp)
	const max = decomposeVec2(maxProp)
	const boundsRef = useRef({min, max})
	boundsRef.current = {min, max}
	const targetGridScale = keys.Shift ? 0.5 : keys.Alt ? 4 : 2
	const [gridScale, setGridScale] = useState(1)

	useEffect(() => {
		let frame: number
		const tick = () => {
			setGridScale(current => {
				const next = current + (targetGridScale - current) * 0.4
				if (Math.abs(next - targetGridScale) < 0.001) return targetGridScale
				frame = requestAnimationFrame(tick)
				return next
			})
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [targetGridScale])

	const dragOptions = useMemo(
		() => ({
			lockPointer: true,
			disabled: () => Boolean(callbacksRef.current.disabled),
			dragDelaySeconds: 0,
			onDragStart() {
				callbacksRef.current.onFocus?.()
			},
			onDrag({delta}: DragState) {
				const speed = keysRef.current.Shift ? 5 : keysRef.current.Alt ? 0.1 : 1
				const modelDelta: [number, number] = [
					delta[0] * speed,
					delta[1] * speed,
				]
				if (keysRef.current.x) modelDelta[1] = 0
				if (keysRef.current.y) modelDelta[0] = 0
				const currentBounds = boundsRef.current
				callbacksRef.current.onChange?.([
					Math.max(
						currentBounds.min?.[0] ?? -Infinity,
						Math.min(
							currentBounds.max?.[0] ?? Infinity,
							valueRef.current[0] + modelDelta[0]
						)
					),
					Math.max(
						currentBounds.min?.[1] ?? -Infinity,
						Math.min(
							currentBounds.max?.[1] ?? Infinity,
							valueRef.current[1] + modelDelta[1]
						)
					),
				])
			},
			onDragEnd() {
				callbacksRef.current.onConfirm?.()
				callbacksRef.current.onBlur?.()
			},
		}),
		[]
	)
	const drag = useDrag(button, dragOptions)
	const geometry = getTranslateOverlayGeometry({
		value,
		min,
		max,
		scale: gridScale,
	})
	const precision = precisionOf(keys.Shift ? 5 : keys.Alt ? 0.1 : 1)

	return (
		<button
			{...props}
			ref={button}
			className={styles.tqInputTranslate}
			type="button"
			disabled={disabled}
			aria-invalid={invalid || undefined}
			inline-position={inlinePosition}
			block-position={blockPosition}
			data-tq-part="root"
		>
			<Icon
				className={styles.gridIcon}
				icon="mingcute:dot-grid-fill"
				data-tq-part="icon"
			/>
			{drag.dragging && (
				<div className={styles.overlay} data-tq-part="overlay">
					<div
						className={styles.overlayGrid}
						style={geometry.grid}
						data-tq-part="overlay-grid"
					>
						{keys.x && <div className={`${styles.axis} ${styles.x}`} />}
						{keys.y && <div className={`${styles.axis} ${styles.y}`} />}
						<div
							className={styles.zero}
							style={geometry.zero}
							data-tq-part="zero"
						/>
					</div>
					{showOverlayLabel && (
						<Tooltip className={styles.overlayLabel}>
							<label>X</label> {value[0].toFixed(precision)} <label>Y</label>{' '}
							{value[1].toFixed(precision)}
						</Tooltip>
					)}
				</div>
			)}
		</button>
	)
}
