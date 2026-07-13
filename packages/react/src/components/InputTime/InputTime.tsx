import {
	compileTimeExpression,
	formatTimecode,
	type InputBoxProps,
	type InputEvents,
	type MenuItem,
	mergeSvgPaths,
	quantizeTimeTweakValue,
	svgLine,
	type TimeFormat,
} from '@tweeq/core'
import {type DragState, inputTimeFormatEntry} from '@tweeq/dom'
import {scalar, vec2} from 'linearly'
import {range} from 'lodash-es'
import {
	type HTMLAttributes,
	type RefObject,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import {
	useConfigRef,
	useDrag,
	useElementBounding,
	useKeys,
	useMultiSelect,
} from '../../hooks'
import {InputTextBase, type InputTextBaseHandle} from '../InputTextBase'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'

const TIME_KEYS = ['q', 'Shift', 'Alt', 'h', 'm', 's', 't'] as const

export interface InputTimeProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			HTMLAttributes<HTMLDivElement>,
			'default' | 'onBlur' | 'onChange' | 'onFocus'
		> {
	value: number
	onChange?: (value: number) => void
	frameRate?: number
	min?: number
	max?: number
	default?: number
}

export function InputTime({
	value,
	onChange,
	frameRate = 24,
	min = -Infinity,
	max = Infinity,
	default: defaultValue,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputTimeProps) {
	const base = useRef<InputTextBaseHandle>(null)
	const target = useMemo(
		() => ({
			get current() {
				return base.current?.getRoot() ?? null
			},
		}),
		[]
	) as RefObject<HTMLDivElement | null>
	const bounds = useElementBounding(target)
	const [format, setFormat] = useConfigRef(inputTimeFormatEntry)
	const [display, setDisplay] = useState(() =>
		printTime(value, format, frameRate)
	)
	const displayRef = useRef(display)
	displayRef.current = display
	const [focused, setFocused] = useState(false)
	const [tweakScaleByHover, setTweakScaleByHover] = useState(0)
	const [parseErrors, setParseErrors] = useState<string[]>([])
	const [overlayMounted, setOverlayMounted] = useState(false)
	const [overlayLeaving, setOverlayLeaving] = useState(false)
	const keys = useKeys(TIME_KEYS)
	const keysRef = useRef(keys)
	keysRef.current = keys
	const valueRef = useRef(value)
	valueRef.current = value
	const localAtFocus = useRef(value)
	const tweakLocal = useRef(value)
	const accumulated = useRef(0)
	const propsRef = useRef({frameRate, min, max, disabled})
	propsRef.current = {frameRate, min, max, disabled}
	const callbacksRef = useRef({onChange, onConfirm, onFocus, onBlur})
	callbacksRef.current = {onChange, onConfirm, onFocus, onBlur}
	const hoverScaleRef = useRef(tweakScaleByHover)
	hoverScaleRef.current = tweakScaleByHover

	const getScale = () => {
		const current = keysRef.current
		if (current.t) return 0
		if (current.s) return 1
		if (current.m) return 2
		if (current.h) return 3
		return scalar.clamp(
			hoverScaleRef.current + (current.Shift ? 1 : current.Alt ? -1 : 0),
			0,
			3
		)
	}
	const getSpeed = () => {
		const scale = getScale()
		const fps = propsRef.current.frameRate
		return scale <= 0
			? 0.25
			: scale === 1
				? fps / 10
				: scale === 2
					? (fps * 60) / 10
					: (fps * 3600) / 100
	}
	const applySnap = (next: number) => {
		const {frameRate: fps, min: lower, max: upper} = propsRef.current
		next = quantizeTimeTweakValue(
			next,
			fps,
			getScale(),
			keysRef.current.q,
			valueRef.current
		)
		return scalar.clamp(next, lower, upper)
	}

	const multi = useMultiSelect({
		type: 'number',
		getElement: () => target.current,
		getValue: () => valueRef.current,
		setValue: next =>
			callbacksRef.current.onChange?.(
				scalar.clamp(Number(next), propsRef.current.min, propsRef.current.max)
			),
		confirm: () => callbacksRef.current.onConfirm?.(),
	})
	const multiRef = useRef(multi)
	multiRef.current = multi

	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(propsRef.current.disabled),
			lockPointer: true,
			onClick(_state: DragState, event: PointerEvent) {
				const digit = (event.target as Element | null)?.closest<HTMLElement>(
					'[data-tq-time-digit]'
				)
				const reverseIndex = Number(digit?.dataset.tqDigitIndex)
				const groups = displayRef.current.split(':')
				const index = groups.length - reverseIndex - 1
				if (!digit || !Number.isInteger(reverseIndex) || index < 0) {
					base.current?.select()
					return
				}
				const start = groups
					.slice(0, index)
					.reduce((length, group) => length + group.length + 1, 0)
				base.current?.select(start, start + groups[index].length)
			},
			onDragStart() {
				tweakLocal.current = valueRef.current
				accumulated.current = 0
				multiRef.current.setFocusing(true)
				multiRef.current.capture()
				callbacksRef.current.onFocus?.()
			},
			onDrag(state: DragState) {
				tweakLocal.current = scalar.clamp(
					tweakLocal.current + state.delta[0] * getSpeed(),
					propsRef.current.min,
					propsRef.current.max
				)
				const next = applySnap(tweakLocal.current)
				callbacksRef.current.onChange?.(next)
				accumulated.current += state.delta[0]
				multiRef.current.update(other => Number(other) + accumulated.current)
			},
			onDragEnd() {
				multiRef.current.setFocusing(false)
				callbacksRef.current.onConfirm?.()
				multiRef.current.confirm()
				callbacksRef.current.onBlur?.()
			},
		}),
		[]
	)
	const drag = useDrag(target, dragOptions)
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
	const scale = getScale()
	const radialLine = (turn: number, inner: number, outer: number) => {
		const degrees = turn * 360 - 90
		return svgLine(
			vec2.dir(degrees, inner, [50, 50]),
			vec2.dir(degrees, outer, [50, 50])
		)
	}
	const meterAngles =
		scale === 0 ? range(0, 1, 1 / frameRate) : range(0, 1, 1 / 12)
	const meters = mergeSvgPaths(
		meterAngles.map(angle => radialLine(angle, 48, 49))
	)
	const frameTick = radialLine((value % frameRate) / frameRate, 48, 48)
	const secondTick = radialLine(
		(Math.floor(value / frameRate) % 60) / 60,
		-15,
		45
	)
	const minuteTick = radialLine(
		(Math.floor(value / (frameRate * 60)) % 60) / 60,
		0,
		40
	)
	const hours = Math.floor(value / (frameRate * 3600)) % 24
	const hourTick = hours ? radialLine(hours / 12, 0, 20) : ''
	useEffect(() => {
		if (!focused) setDisplay(printTime(value, format, frameRate))
	}, [focused, format, frameRate, value])

	const confirm = () => {
		onConfirm?.()
		setDisplay(printTime(valueRef.current, format, frameRate))
	}
	const menuItems: MenuItem[] = [
		{
			label: 'Frames',
			icon: format === 'frames' ? 'mdi:check' : undefined,
			perform: () => setFormat('frames'),
		},
		{
			label: 'SMPTE Timecode',
			icon: format === 'timecode' ? 'mdi:check' : undefined,
			perform: () => setFormat('timecode'),
		},
	]
	const digits = format === 'timecode' ? display.split(':').reverse() : null

	return (
		<InputTextBase
			{...props}
			ref={base}
			className={className}
			data-tq-input-time=""
			value={display}
			inlinePosition={inlinePosition}
			blockPosition={blockPosition}
			ignoreInput={!focused}
			active={multi.subfocus}
			font="numeric"
			leftIcon="mdi:clock"
			align="center"
			disabled={disabled}
			invalid={invalid || parseErrors.length > 0}
			default={defaultValue}
			menuItems={menuItems}
			onPointerEnter={() => setTweakScaleByHover(0)}
			onFocus={() => {
				setFocused(true)
				localAtFocus.current = valueRef.current
				multi.setFocusing(true)
				multi.capture()
				onFocus?.()
			}}
			onBlur={() => {
				setFocused(false)
				multi.setFocusing(false)
				confirm()
				onBlur?.()
			}}
			onChange={nextDisplay => {
				setDisplay(nextDisplay)
				const expression = compileTimeExpression(nextDisplay, frameRate)
				const result = expression(localAtFocus.current, {
					i: multi.index,
					fps: frameRate,
				})
				setParseErrors(result.log)
				if (result.value !== undefined) {
					onChange?.(scalar.clamp(result.value, min, max))
					multi.update((other, context) => {
						const parsed = expression(Number(other), {
							...context,
							fps: frameRate,
						})
						return parsed.value ?? other
					})
				}
			}}
			onKeyDown={event => {
				if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
				event.preventDefault()
				const direction = event.key === 'ArrowUp' ? 1 : -1
				const increment = event.altKey
					? 1
					: event.shiftKey
						? 60 * frameRate
						: frameRate
				onChange?.(
					scalar.clamp(valueRef.current + direction * increment, min, max)
				)
				confirm()
			}}
			onConfirm={confirm}
			onReset={() => {
				if (defaultValue !== undefined) {
					onChange?.(defaultValue)
					onConfirm?.()
				}
			}}
			renderInactiveContent={() => (
				<div data-tq-part="time-digits">
					{digits ? (
						digits.map((digit, index) => (
							<div key={`${digit}-${index}`} data-tq-part="digit-group">
								<div
									data-tq-time-digit=""
									data-tq-digit-index={index}
									data-tq-active={index === scale ? '' : undefined}
									data-tq-part="digit"
									onPointerEnter={() => setTweakScaleByHover(index)}
								>
									{digit}
									{index === scale && (
										<Tooltip data-tq-part="digit-label">
											<label>
												{['F', 'Secs', 'Mins', 'Hrs'][index] ?? 'Hrs'}
											</label>
										</Tooltip>
									)}
								</div>
								{index !== digits.length - 1 && (
									<div data-tq-part="separator">:</div>
								)}
							</div>
						))
					) : (
						<div data-tq-part="frame-display">{display}</div>
					)}
				</div>
			)}
			renderFront={() =>
				drag.dragging || overlayMounted ? (
					<TweakOverlay>
						<div
							style={{
								left: bounds.x + bounds.width / 2,
								top: bounds.y + bounds.height / 2,
							}}
							data-tq-component="input-time-overlay"
							data-tq-leaving={overlayLeaving ? '' : undefined}
							data-tq-part="overlay"
							onTransitionEnd={event => {
								if (overlayLeaving && event.target === event.currentTarget) {
									setOverlayMounted(false)
									setOverlayLeaving(false)
								}
							}}
						>
							<svg viewBox="0 0 100 100" data-tq-part="overlay-svg">
								<path d={meters} data-tq-tick="meters" />
								<path
									d={frameTick}
									data-tq-tick="frame"
									data-tq-active={scale === 0 ? '' : undefined}
								/>
								<path
									d={secondTick}
									data-tq-tick="second"
									data-tq-active={scale === 1 ? '' : undefined}
								/>
								<path
									d={minuteTick}
									data-tq-tick="minute"
									data-tq-active={scale === 2 ? '' : undefined}
								/>
								<path
									d={hourTick}
									data-tq-tick="hour"
									data-tq-active={scale === 3 ? '' : undefined}
								/>
							</svg>
						</div>
					</TweakOverlay>
				) : null
			}
		/>
	)
}

function printTime(
	value: number,
	format: TimeFormat,
	frameRate: number
): string {
	return format === 'frames' ? `${value}F` : formatTimecode(value, frameRate)
}
