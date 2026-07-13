import {
	clampPosWithinRect,
	getRotaryDragValue,
	type InputBoxProps,
	type InputEvents,
	mergeSvgPaths,
	type Rect,
	signedAngleBetween,
	svgArc,
	svgCircle,
	svgLine,
	unsignedMod,
} from '@tweeq/core'
import {type DragState} from '@tweeq/dom'
import {scalar, vec2} from 'linearly'
import {range} from 'lodash-es'
import {
	type ButtonHTMLAttributes,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import {useStore} from 'zustand'

import {
	useCopyPaste,
	useCursorStyle,
	useDrag,
	useElementCenter,
	useKeys,
	useLastActive,
	useMultiSelect,
	useWindowSize,
} from '../../hooks'
import {useTweeqRuntime} from '../../runtime'
import {SvgIcon} from '../SvgIcon'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'

const ROTARY_KEYS = ['Shift', 'q', 'a', 'r'] as const

export interface InputRotaryProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			ButtonHTMLAttributes<HTMLButtonElement>,
			'onBlur' | 'onChange' | 'onFocus' | 'value'
		> {
	value: number
	onChange?: (value: number) => void
	snap?: number
	angleOffset?: number
}

export function InputRotary({
	value,
	onChange,
	snap = 45,
	angleOffset = -90,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputRotaryProps) {
	const {themeStore} = useTweeqRuntime()
	const root = useRef<HTMLButtonElement>(null)
	const center = useElementCenter(root)
	const centerRef = useRef(center)
	centerRef.current = center
	const keys = useKeys(ROTARY_KEYS)
	const keysRef = useRef(keys)
	keysRef.current = keys
	const keyMode = useLastActive({absolute: keys.a, relative: keys.r})
	const [pointerMode, setPointerMode] = useState<'absolute' | 'relative'>(
		'relative'
	)
	const mode = keyMode ?? pointerMode
	const modeRef = useRef(mode)
	modeRef.current = mode
	const [local, setLocal] = useState(value)
	const localRef = useRef(local)
	localRef.current = local
	const valueRef = useRef(value)
	valueRef.current = value
	const initialValue = useRef(value)
	const inputHeight = useStore(themeStore, state => state.inputHeight)
	const snapRadii: vec2 = [inputHeight * 4, 160]
	const snapRadiiRef = useRef(snapRadii)
	snapRadiiRef.current = snapRadii
	const callbacksRef = useRef({
		onChange,
		onConfirm,
		onFocus,
		onBlur,
		disabled,
		snap,
		angleOffset,
	})
	callbacksRef.current = {
		onChange,
		onConfirm,
		onFocus,
		onBlur,
		disabled,
		snap,
		angleOffset,
	}
	const dragRef = useRef<DragState | null>(null)

	const multi = useMultiSelect({
		type: 'number',
		getElement: () => root.current,
		getValue: () => localRef.current,
		setValue: next => {
			const number = Number(next)
			setLocal(number)
			localRef.current = number
			callbacksRef.current.onChange?.(number)
		},
		confirm: () => callbacksRef.current.onConfirm?.(),
	})
	const multiRef = useRef(multi)
	multiRef.current = multi

	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(callbacksRef.current.disabled),
			dragDelaySeconds: 0,
			onDragStart(state: DragState) {
				dragRef.current = state
				initialValue.current = valueRef.current
				let next = valueRef.current
				if (modeRef.current === 'absolute') {
					const point = vec2.sub(state.xy, centerRef.current)
					const angle = vec2.angle(point) - callbacksRef.current.angleOffset
					next += signedAngleBetween(angle, next)
				}
				setLocal(next)
				localRef.current = next
				multiRef.current.capture()
			},
			onDrag(state: DragState) {
				dragRef.current = state
				const rect = root.current?.getBoundingClientRect()
				const liveCenter: vec2 = rect
					? [rect.left + rect.width / 2, rect.top + rect.height / 2]
					: centerRef.current
				const point = vec2.sub(state.xy, liveCenter)
				const previous = vec2.sub(state.previous, liveCenter)
				const deltaAngle = vec2.angle(previous, point)
				const radius = vec2.dist(liveCenter, state.xy)
				const shouldSnap =
					keysRef.current.Shift ||
					keysRef.current.q ||
					(snapRadiiRef.current[0] <= radius &&
						radius <= snapRadiiRef.current[1])
				const next = getRotaryDragValue(
					localRef.current,
					deltaAngle,
					callbacksRef.current.snap,
					shouldSnap
				)
				setLocal(next.local)
				localRef.current = next.local
				callbacksRef.current.onChange?.(next.output)
				if (modeRef.current === 'absolute') {
					multiRef.current.update(() => next.output)
				} else {
					const delta = next.output - initialValue.current
					multiRef.current.update(other => {
						const updated = Number(other) + delta
						return shouldSnap
							? scalar.quantize(updated, callbacksRef.current.snap)
							: updated
					})
				}
			},
			onDragEnd() {
				callbacksRef.current.onConfirm?.()
				multiRef.current.confirm()
			},
		}),
		[]
	)
	const drag = useDrag(root, dragOptions)
	dragRef.current = drag
	useEffect(() => {
		if (!drag.dragging) {
			setLocal(value)
			localRef.current = value
		}
	}, [drag.dragging, value])
	useCursorStyle(drag.dragging ? 'none' : null)
	useCopyPaste({
		target: root,
		onCopy: () =>
			void navigator.clipboard.writeText(valueRef.current.toString()),
		onPaste: async () => {
			const pasted = parseFloat(await navigator.clipboard.readText())
			if (Number.isNaN(pasted)) return
			callbacksRef.current.onChange?.(pasted)
			multiRef.current.update(() => pasted)
			multiRef.current.confirm()
		},
	})

	const shouldSnap =
		keys.Shift ||
		keys.q ||
		(snapRadii[0] <= vec2.dist(center, drag.xy) &&
			vec2.dist(center, drag.xy) <= snapRadii[1])
	const windowSize = useWindowSize()
	const bounds: Rect = [
		[40, 40],
		[windowSize.width - 40, windowSize.height - 40],
	]
	const labelPosition = clampPosWithinRect(drag.initial, drag.xy, bounds)
	const overlayArrowRotation =
		vec2.angle(vec2.sub(drag.xy, drag.origin)) + 90
	const display = `${Math.trunc(value / 360) ? `${Math.trunc(value / 360)}x ` : ''}${(
		value -
		Math.trunc(value / 360) * 360
	).toFixed(1)}°`
	const markerId = useId().replaceAll(':', '')
	const radialLine = (angle: number, inner: number, outer: number) => {
		const adjusted = angle + angleOffset
		return svgLine(
			vec2.dir(adjusted, inner, center),
			vec2.dir(adjusted, outer, center)
		)
	}
	const metersPath = mergeSvgPaths(
		range(0, 360, snap).map(angle => radialLine(angle, ...snapRadii))
	)
	const overlayPath = (() => {
		if (mode === 'absolute') {
			return radialLine(value, inputHeight, vec2.dist(center, drag.xy))
		}
		const baseRadius = inputHeight * 4
		const radiusStep = inputHeight * 0.25
		const start = initialValue.current + angleOffset
		const end = value + angleOffset
		const turns =
			Math.floor(Math.abs(end - start) / 360) * Math.sign(end - start)
		const revolutions = range(0, turns).map(index =>
			svgCircle(center, baseRadius + index * radiusStep)
		)
		let offsetInTurn = unsignedMod(signedAngleBetween(end, start), 360)
		if (end < start) offsetInTurn -= 360
		const startInTurn = unsignedMod(start, 360)
		const arc = svgArc(
			center,
			baseRadius + turns * radiusStep,
			startInTurn,
			startInTurn + offsetInTurn
		)
		return mergeSvgPaths([...revolutions, arc])
	})()
	const activeMeterPath =
		shouldSnap && value % snap === 0 ? radialLine(value, ...snapRadii) : ''

	return (
		<>
			<button
				{...props}
				ref={root}
				className={className}
				type="button"
				disabled={disabled}
				aria-invalid={invalid || undefined}
				inline-position={inlinePosition}
				block-position={blockPosition}
				data-tq-component="input-rotary"
				data-tq-tweaking={drag.dragging ? '' : undefined}
				data-tq-subfocus={multi.subfocus ? '' : undefined}
				data-tq-tweak-mode={mode}
				data-tq-part="root"
				onFocus={() => {
					multi.setFocusing(true)
					onFocus?.()
				}}
				onBlur={() => {
					multi.setFocusing(false)
					onBlur?.()
				}}
			>
				<SvgIcon
					mode="block"
					data-tq-part="rotary"
				>
					<circle data-tq-part="circle" cx="16" cy="16" r="16" />
					<g
						style={{
							transformOrigin: '16px 16px',
							transform: `rotate(${value + angleOffset}deg)`,
						}}
						data-tq-part="indicator"
						onPointerEnter={() => setPointerMode('absolute')}
						onPointerLeave={() => !drag.dragging && setPointerMode('relative')}
					>
						<path
							data-tq-part="absolute-mode-area"
							d="M 16 16 L 16 32 A 16 16 0 0 0 16 0 Z"
						/>
						<path data-tq-part="tip" d="M20 16 L30 16" />
					</g>
					<circle
						cx="16"
						cy="16"
						r="7"
						fill="transparent"
						stroke="none"
						data-tq-part="relative-mode-area"
					/>
				</SvgIcon>
			</button>
			{drag.dragging && (
				<TweakOverlay>
					<div
						data-tq-component="input-rotary-overlay"
						data-tq-part="overlay"
					>
						<svg>
							<defs>
								<marker
									id={markerId}
									markerWidth="6"
									markerHeight="6"
									refX="3"
									refY="3"
									orient="auto"
									fill="var(--tq-color-accent)"
								>
									<path d="M 0 0 L 6 3 L 0 6 Z" />
								</marker>
							</defs>
							<path
								data-tq-part="meter-path"
								data-tq-snap={shouldSnap ? '' : undefined}
								d={metersPath}
							/>
							<path
								data-tq-part="drag-path"
								d={overlayPath}
								markerEnd={
									mode === 'relative' ? `url(#${markerId})` : undefined
								}
							/>
							<path
								data-tq-part="active-meter-path"
								d={activeMeterPath}
							/>
						</svg>
						<Tooltip
							data-tq-part="overlay-label"
							style={{left: labelPosition[0], top: labelPosition[1]}}
						>
							{display}
							<span
								data-tq-part="arrows"
								style={{transform: `rotate(${overlayArrowRotation}deg)`}}
							/>
						</Tooltip>
					</div>
				</TweakOverlay>
			)}
		</>
	)
}
