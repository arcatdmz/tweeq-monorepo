import {
	type ColorChannel,
	colorChannelToIndex,
	type ColorPickerComponent,
	css2hsva,
	getColorPadTweak,
	getHSVAChannel,
	hsv2rgb,
	type HSVA,
	hsva2hex,
	type InputBoxProps,
	type InputEvents,
	tweakHSVAChannel,
} from '@tweeq/core'
import {type DragState, themeStore} from '@tweeq/dom'
import PadFragmentString from '@tweeq/dom/shaders/pad.frag'
import SliderFragmentString from '@tweeq/dom/shaders/slider.frag'
import WheelFragmentString from '@tweeq/dom/shaders/wheel.frag'
import chroma from 'chroma-js'
import Color from 'colorjs.io'
import {type vec2} from 'linearly'
import {
	type ButtonHTMLAttributes,
	type CSSProperties,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {useStore} from 'zustand'

import {
	useCopyPaste,
	useDrag,
	useEventListener,
	useKeys,
	useMultiSelect,
} from '../../hooks'
import {GlslCanvas} from '../GlslCanvas'
import {Popover} from '../Popover'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'
import {InputColorPicker} from './InputColorPicker'

const COLOR_KEYS = [
	'Shift',
	'Meta',
	'Control',
	'Alt',
	'h',
	'f',
	'a',
	's',
	'v',
	'r',
	'g',
	'b',
] as const

export interface InputColorPadProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			ButtonHTMLAttributes<HTMLButtonElement>,
			'onBlur' | 'onChange' | 'onFocus' | 'value'
		> {
	value: string
	onChange?: (value: string) => void
	alpha?: boolean
	pickers?: readonly ColorPickerComponent[]
	presets?: readonly string[]
	onChangeTweaking?: (value: boolean) => void
	children?: ReactNode
}

export function InputColorPad({
	value,
	onChange,
	alpha = true,
	pickers,
	presets,
	onChangeTweaking,
	onFocus,
	onBlur,
	onConfirm,
	inlinePosition,
	blockPosition,
	disabled,
	invalid,
	children,
	className,
	...props
}: InputColorPadProps) {
	const button = useRef<HTMLButtonElement>(null)
	const floating = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)
	const [floatingFocused, setFloatingFocused] = useState(false)
	const [local, setLocal] = useState<HSVA>(() => css2hsva(value))
	const [wheelTweaking, setWheelTweaking] = useState(false)
	const [overlayMounted, setOverlayMounted] = useState(false)
	const [overlayLeaving, setOverlayLeaving] = useState(false)
	const wheelTimeout = useRef<number | undefined>(undefined)
	const theme = useStore(themeStore)
	const keys = useKeys(COLOR_KEYS)
	const tweakMode: ColorChannel | 'pad' =
		keys.Shift || keys.h || keys.f
			? 'h'
			: keys.s
				? 's'
				: keys.v
					? 'v'
					: keys.r
						? 'r'
						: keys.g
							? 'g'
							: keys.b
								? 'b'
								: alpha && (keys.Alt || keys.a)
									? 'a'
									: 'pad'
	const localRef = useRef(local)
	localRef.current = local
	const valueRef = useRef(value)
	valueRef.current = value
	const modeRef = useRef(tweakMode)
	modeRef.current = tweakMode
	const localOnTweak = useRef<HSVA | null>(null)
	const callbacks = useRef({
		onChange,
		onChangeTweaking,
		onFocus,
		onBlur,
		onConfirm,
	})
	callbacks.current = {onChange, onChangeTweaking, onFocus, onBlur, onConfirm}
	const multiRef = useRef<ReturnType<typeof useMultiSelect> | null>(null)
	const popupWidth = theme.popupWidth

	const dragOptions = useMemo(
		() => ({
			lockPointer: true,
			disabled: () => disabled ?? false,
			onClick: () => {
				if (!multiRef.current?.multiSelected) setOpen(current => !current)
			},
			onDragStart: () => {
				const next = css2hsva(valueRef.current)
				localRef.current = next
				setLocal(next)
				localOnTweak.current = next
				multiRef.current?.capture()
				callbacks.current.onChangeTweaking?.(true)
			},
			onDrag: ({delta}: DragState) => {
				const [dx, dy] = [delta[0] / popupWidth, delta[1] / -popupWidth]
				const mode = modeRef.current
				const initial = localOnTweak.current
				if (!initial) return
				const result = getColorPadTweak(
					localRef.current,
					initial,
					mode,
					dx,
					dy
				)
				const next = result.value
				multiRef.current?.update(result.updateRelated)

				localRef.current = next
				setLocal(next)
				callbacks.current.onChange?.(hsva2hex(next))
			},
			onDragEnd: () => {
				callbacks.current.onConfirm?.()
				multiRef.current?.confirm()
				callbacks.current.onChangeTweaking?.(false)
			},
		}),
		[disabled, popupWidth]
	)
	const drag = useDrag(button, dragOptions)
	const multi = useMultiSelect({
		type: 'color',
		getElement: () => button.current,
		getValue: () => localRef.current,
		setValue: (next: HSVA) => {
			localRef.current = next
			setLocal(next)
			callbacks.current.onChange?.(hsva2hex(next))
		},
		confirm: () => callbacks.current.onConfirm?.(),
	})
	multiRef.current = multi

	useEffect(() => {
		if (!drag.dragging) {
			const next = css2hsva(value)
			localRef.current = next
			setLocal(next)
		}
	}, [drag.dragging, value])
	useEffect(() => {
		if (drag.dragging) setOpen(false)
	}, [drag.dragging])
	useEffect(() => {
		if (drag.dragging) {
			setOverlayMounted(true)
			setOverlayLeaving(false)
			return
		}
		if (!overlayMounted) return

		setOverlayLeaving(true)
		const timeout = window.setTimeout(() => {
			setOverlayMounted(false)
			setOverlayLeaving(false)
		}, 200)
		return () => window.clearTimeout(timeout)
	}, [drag.dragging, overlayMounted])
	useEffect(
		() => () => {
			window.clearTimeout(wheelTimeout.current)
		},
		[]
	)
	useEffect(() => {
		if (!drag.dragging || !localOnTweak.current) return
		localOnTweak.current = localRef.current
		multi.capture()
	}, [tweakMode])
	useEffect(() => {
		if (multi.multiSelected) setOpen(false)
	}, [multi.multiSelected])
	useEventListener<WheelEvent>(
		button,
		'wheel',
		event => {
			if (drag.dragging && localOnTweak.current) {
				event.preventDefault()
				event.stopPropagation()
				const next = tweakHSVAChannel(
					localRef.current,
					'h',
					(event.deltaY / 360) * 0.5
				)
				localRef.current = next
				setLocal(next)
				callbacks.current.onChange?.(hsva2hex(next))
				const amount = next.h - localOnTweak.current.h
				multi.update((hsva: HSVA) => tweakHSVAChannel(hsva, 'h', amount))
			}
			if (drag.dragging) {
				setWheelTweaking(true)
				window.clearTimeout(wheelTimeout.current)
				wheelTimeout.current = window.setTimeout(
					() => setWheelTweaking(false),
					500
				)
			}
		},
		{passive: false}
	)
	useCopyPaste({
		target: button,
		onCopy: () => void navigator.clipboard.writeText(valueRef.current),
		onPaste: () => {
			void navigator.clipboard.readText().then(text => {
				if (!text) return
				const next = css2hsva(text)
				callbacks.current.onChange?.(text)
				multi.update(() => next)
				multi.confirm()
			})
		},
	})

	const temporarilyHidePopup =
		!floatingFocused && (keys.Shift || keys.Meta || keys.Control)
	const displayColor = chroma.valid(value) ? value : 'black'
	const rgb = hsv2rgb(local)
	const overlayLabel: [string, string, boolean?][] =
		tweakMode === 'h'
			? [['Hue', `${(local.h * 360).toFixed(1)}°`]]
			: tweakMode === 's' || tweakMode === 'v' || tweakMode === 'a'
				? [
						[
							tweakMode === 's' ? 'Sat' : tweakMode === 'v' ? 'Val' : 'α',
							`${(local[tweakMode] * 100).toFixed(1)}%`,
						],
					]
				: tweakMode === 'r' || tweakMode === 'g' || tweakMode === 'b'
					? [[tweakMode.toUpperCase(), (rgb[tweakMode] * 255).toFixed(0), true]]
					: [
							['Sat', `${(local.s * 100).toFixed(1)}%`],
							['Val', `${(local.v * 100).toFixed(1)}%`],
						]
	const contrast = Color.contrastWCAG21(displayColor, theme.backgroundColor)
	const swatchStyle = {
		color: displayColor,
		'--outline': contrast > 1.1 ? 'transparent' : 'var(--tq-color-border)',
	} as CSSProperties
	const offsetStyle = {left: drag.origin[0], top: drag.origin[1]}
	const padUniforms = useMemo(
		() => ({
			hsva: [local.h, local.s, local.v, local.a],
			axes: [colorChannelToIndex('s'), colorChannelToIndex('v')],
		}),
		[local]
	)
	const wheelUniforms = useMemo(
		() => ({hsva: [local.h, local.s, local.v, local.a]}),
		[local]
	)
	const sliderUniforms = useMemo(
		() => ({
			hsva: [local.h, local.s, local.v, local.a],
			axis: colorChannelToIndex(tweakMode === 'pad' ? 's' : tweakMode),
			offset: 0,
		}),
		[local, tweakMode]
	)
	const sliderValue =
		tweakMode === 'pad' ? 0.5 : getHSVAChannel(local, tweakMode)
	const sliderOffset: vec2 =
		tweakMode === 'v'
			? [0, -(sliderValue - 0.5) * popupWidth]
			: [-(sliderValue - 0.5) * popupWidth, 0]

	return (
		<>
			<button
				{...props}
				ref={button}
				type={props.type ?? 'button'}
				disabled={disabled}
				aria-invalid={invalid || undefined}
				className={className}
				data-tq-component="input-color-pad"
				data-tq-focus={
					(open && temporarilyHidePopup) || multi.subfocus ? '' : undefined
				}
				data-tq-tweaking={drag.dragging ? '' : undefined}
				onFocus={() => {
					multi.setFocusing(true)
					onFocus?.()
				}}
				onBlur={() => {
					multi.setFocusing(false)
					onBlur?.()
				}}
			>
				{children ?? (
					<div
						style={swatchStyle}
						inline-position={inlinePosition}
						block-position={blockPosition}
						data-tq-part="swatch"
					/>
				)}
			</button>
			<Popover
				open={open && !temporarilyHidePopup}
				reference={button.current}
				placement="bottom-start"
				onChangeOpen={setOpen}
			>
				<div
					ref={floating}
					data-tq-component="input-color-pad-popover"
					data-tq-part="floating"
					onFocusCapture={() => setFloatingFocused(true)}
					onBlurCapture={event => {
						if (!event.currentTarget.contains(event.relatedTarget))
							setFloatingFocused(false)
					}}
				>
					<InputColorPicker
						value={value}
						onChange={onChange}
						onConfirm={onConfirm}
						alpha={alpha}
						pickers={pickers}
						presets={presets}
					/>
				</div>
			</Popover>
			{(drag.dragging || overlayMounted) && (
				<TweakOverlay>
					<div
						className={
							overlayLeaving
								? 'tq-input-color-pad-overlay-hidden'
								: undefined
						}
						style={{transformOrigin: `${drag.origin[0]}px ${drag.origin[1]}px`}}
						data-tq-component="input-color-pad-overlay"
						data-tq-tweak-mode={tweakMode}
						data-tq-part="overlay"
						onTransitionEnd={event => {
							if (overlayLeaving && event.target === event.currentTarget) {
								setOverlayMounted(false)
								setOverlayLeaving(false)
							}
						}}
					>
						{(tweakMode === 'pad' ||
							tweakMode === 'h' ||
							tweakMode === 's' ||
							tweakMode === 'v') && (
							<>
								<GlslCanvas
									data-tq-part="overlay-pad"
									fragmentString={PadFragmentString}
									uniforms={padUniforms}
									style={{
										opacity: tweakMode === 'pad' ? 1 : 0.1,
										left: drag.origin[0] - local.s * popupWidth,
										top: drag.origin[1] - (1 - local.v) * popupWidth,
									}}
								/>
								<GlslCanvas
									data-tq-part="wheel"
									fragmentString={WheelFragmentString}
									uniforms={wheelUniforms}
									style={{
										...offsetStyle,
										opacity: tweakMode === 'h' || wheelTweaking ? 1 : 0.1,
										rotate: `${local.h * -360}deg`,
									}}
								/>
							</>
						)}
						{tweakMode !== 'pad' && tweakMode !== 'h' && (
							<GlslCanvas
								data-tq-part="slider"
								data-tq-vertical={tweakMode === 'v' ? '' : undefined}
								fragmentString={SliderFragmentString}
								uniforms={sliderUniforms}
								style={{
									left: drag.origin[0] + sliderOffset[0],
									top: drag.origin[1] - sliderOffset[1],
								}}
							/>
						)}
						<div
							data-tq-part="tweak-preview"
							style={{
								...offsetStyle,
								color:
									tweakMode === 'a'
										? displayColor
										: chroma(displayColor).alpha(1).css(),
							}}
						/>
						<Tooltip data-tq-part="overlay-label" style={offsetStyle}>
							{overlayLabel.map(([label, display, isRgb]) => (
								<span key={label} data-tq-part="label-pair">
									<label>{label}</label>{' '}
									<span
										data-tq-part="label-value"
										data-tq-rgb={isRgb ? '' : undefined}
									>
										{display}
									</span>
								</span>
							))}
						</Tooltip>
					</div>
				</TweakOverlay>
			)}
		</>
	)
}
