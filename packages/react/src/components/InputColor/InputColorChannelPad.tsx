import {
	type ColorChannel,
	colorChannelToIndex,
	getHSVAChannel,
	type HSVA,
	hsva2hex,
	setHSVAChannel,
	toPercent,
	tweakHSVAChannel,
} from '@tweeq/core'
import PadFragmentString from '@tweeq/dom/shaders/pad.frag'
import {type CSSProperties, useMemo, useRef} from 'react'

import {useDrag} from '../../hooks'
import {GlslCanvas} from '../GlslCanvas'
import styles from './InputColorChannelPad.module.styl'

export interface InputColorChannelPadProps {
	value: HSVA
	onChange?: (value: HSVA) => void
	axes: readonly [ColorChannel, ColorChannel]
	disabled?: boolean
}

export function InputColorChannelPad({
	value,
	onChange,
	axes,
	disabled,
}: InputColorChannelPadProps) {
	const root = useRef<HTMLDivElement>(null)
	const local = useRef(value)
	const current = useRef({value, onChange, axes})
	current.current = {value, onChange, axes}
	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(disabled),
			dragDelaySeconds: 0,
			onDragStart: (
				state: {
					xy: readonly [number, number]
					left: number
					right: number
					top: number
					bottom: number
				},
				event: PointerEvent
			) => {
				local.current = current.current.value
				if (event.target !== root.current) return
				const x = (state.xy[0] - state.left) / (state.right - state.left)
				const y = (state.bottom - state.xy[1]) / (state.bottom - state.top)
				local.current = setHSVAChannel(
					local.current,
					current.current.axes[0],
					x
				)
				local.current = setHSVAChannel(
					local.current,
					current.current.axes[1],
					y
				)
				current.current.onChange?.(local.current)
			},
			onDrag: (state: {
				xy: readonly [number, number]
				initial: readonly [number, number]
				width: number
				height: number
			}) => {
				let next = tweakHSVAChannel(
					local.current,
					current.current.axes[0],
					(state.xy[0] - state.initial[0]) / state.width
				)
				next = tweakHSVAChannel(
					next,
					current.current.axes[1],
					(state.initial[1] - state.xy[1]) / state.height
				)
				current.current.onChange?.(next)
			},
		}),
		[disabled]
	)
	const drag = useDrag(root, dragOptions)
	const uniforms = useMemo(() => {
		const {h, s, v, a} = value
		return {hsva: [h, s, v, a], axes: axes.map(colorChannelToIndex)}
	}, [axes, value])
	const x = getHSVAChannel(value, axes[0])
	const y = getHSVAChannel(value, axes[1])
	const tweakingInside =
		drag.dragging &&
		drag.left <= drag.xy[0] &&
		drag.right >= drag.xy[0] &&
		drag.top <= drag.xy[1] &&
		drag.bottom >= drag.xy[1]

	return (
		<div
			ref={root}
			className={styles.pad}
			style={{cursor: tweakingInside ? 'none' : undefined}}
		>
			<GlslCanvas
				className={styles.canvas}
				fragmentString={PadFragmentString}
				uniforms={uniforms}
			/>
			<div
				className={`${styles.circle} ${drag.dragging ? styles.tweaking : ''}`}
				style={
					{
						left: toPercent(x),
						bottom: toPercent(y),
						background: hsva2hex({...value, a: 1}),
					} as CSSProperties
				}
			/>
		</div>
	)
}
