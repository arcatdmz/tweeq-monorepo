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
import SliderFragmentString from '@tweeq/dom/shaders/slider.frag'
import {useMemo, useRef} from 'react'

import {useDrag} from '../../hooks'
import {GlslCanvas} from '../GlslCanvas'

export interface InputColorChannelSliderProps {
	value: HSVA
	onChange?: (value: HSVA) => void
	axis: ColorChannel
	disabled?: boolean
}

export function InputColorChannelSlider({
	value,
	onChange,
	axis,
	disabled,
}: InputColorChannelSliderProps) {
	const root = useRef<HTMLDivElement>(null)
	const local = useRef(value)
	const current = useRef({value, onChange, axis})
	current.current = {value, onChange, axis}
	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(disabled),
			dragDelaySeconds: 0,
			onDragStart: (
				state: {xy: readonly [number, number]; left: number; right: number},
				event: PointerEvent
			) => {
				local.current = current.current.value
				if (event.target !== root.current) return
				const t = (state.xy[0] - state.left) / (state.right - state.left)
				local.current = setHSVAChannel(local.current, current.current.axis, t)
				current.current.onChange?.(local.current)
			},
			onDrag: (state: {
				xy: readonly [number, number]
				initial: readonly [number, number]
				width: number
			}) => {
				current.current.onChange?.(
					tweakHSVAChannel(
						local.current,
						current.current.axis,
						(state.xy[0] - state.initial[0]) / state.width
					)
				)
			},
		}),
		[disabled]
	)
	const drag = useDrag(root, dragOptions)
	const uniforms = useMemo(() => {
		const {h, s, v, a} = value
		return {hsva: [h, s, v, a], axis: colorChannelToIndex(axis), offset: 0}
	}, [axis, value])
	const tweakingInside =
		drag.dragging &&
		drag.left <= drag.xy[0] &&
		drag.right >= drag.xy[0] &&
		drag.top <= drag.xy[1] &&
		drag.bottom >= drag.xy[1]

	return (
		<div
			ref={root}
			data-tq-component="input-color-channel-slider"
			data-tq-part="root"
			style={{cursor: tweakingInside ? 'none' : undefined}}
		>
			<GlslCanvas
				data-tq-part="canvas"
				fragmentString={SliderFragmentString}
				uniforms={uniforms}
			/>
			<button
				type="button"
				aria-label={`${axis.toUpperCase()} channel`}
				disabled={disabled}
				data-tq-part="handle"
				data-tq-tweaking={drag.dragging ? '' : undefined}
				style={{
					left: toPercent(getHSVAChannel(value, axis)),
					background: hsva2hex({...value, a: 1}),
				}}
			/>
		</div>
	)
}
