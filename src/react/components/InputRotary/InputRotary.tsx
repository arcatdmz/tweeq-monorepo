import {Path, type Rect} from '@baku89/pave'
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
	clampPosWithinRect,
	type DragState,
	type InputBoxProps,
	type InputEvents,
	signedAngleBetween,
	themeStore,
	unsignedMod,
} from '../../../core'
import {classNames} from '../../classNames'
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
import {SvgIcon} from '../SvgIcon'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'
import styles from './InputRotary.module.styl'

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
				const point = vec2.sub(state.xy, centerRef.current)
				const previous = vec2.sub(state.previous, centerRef.current)
				let next = localRef.current + vec2.angle(previous, point)
				const radius = vec2.dist(centerRef.current, state.xy)
				const shouldSnap =
					keysRef.current.Shift ||
					keysRef.current.q ||
					(snapRadiiRef.current[0] <= radius &&
						radius <= snapRadiiRef.current[1])
				const result = shouldSnap
					? scalar.quantize(next, callbacksRef.current.snap)
					: next
				next = Number.isFinite(result) ? result : next
				setLocal(next)
				localRef.current = next
				callbacksRef.current.onChange?.(next)
				if (modeRef.current === 'absolute') {
					multiRef.current.update(() => next)
				} else {
					const delta = next - initialValue.current
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
	const display = `${Math.trunc(value / 360) ? `${Math.trunc(value / 360)}x ` : ''}${(
		value -
		Math.trunc(value / 360) * 360
	).toFixed(1)}°`
	const markerId = useId().replaceAll(':', '')
	const radialLine = (angle: number, inner: number, outer: number) => {
		const adjusted = angle + angleOffset
		return Path.line(
			vec2.dir(adjusted, inner, center),
			vec2.dir(adjusted, outer, center)
		)
	}
	const metersPath = Path.toSVGString(
		Path.merge(
			range(0, 360, snap).map(angle => radialLine(angle, ...snapRadii))
		)
	)
	const overlayPath = (() => {
		if (mode === 'absolute') {
			return Path.toSVGString(
				radialLine(value, inputHeight, vec2.dist(center, drag.xy))
			)
		}
		const baseRadius = inputHeight * 4
		const radiusStep = inputHeight * 0.25
		const start = initialValue.current + angleOffset
		const end = value + angleOffset
		const turns =
			Math.floor(Math.abs(end - start) / 360) * Math.sign(end - start)
		const revolutions = range(0, turns).map(index =>
			Path.circle(center, baseRadius + index * radiusStep)
		)
		let offsetInTurn = unsignedMod(signedAngleBetween(end, start), 360)
		if (end < start) offsetInTurn -= 360
		const startInTurn = unsignedMod(start, 360)
		const arc = Path.arc(
			center,
			baseRadius + turns * radiusStep,
			startInTurn,
			startInTurn + offsetInTurn
		)
		return Path.toSVGString(Path.merge([...revolutions, arc]))
	})()
	const activeMeterPath = Path.toSVGString(
		shouldSnap && value % snap === 0
			? radialLine(value, ...snapRadii)
			: Path.empty
	)

	return (
		<>
			<button
				{...props}
				ref={root}
				className={classNames(
					styles.tqInputRotary,
					drag.dragging && styles.tweaking,
					multi.subfocus && styles.subfocus,
					className
				)}
				type="button"
				disabled={disabled}
				aria-invalid={invalid || undefined}
				inline-position={inlinePosition}
				block-position={blockPosition}
				{...{'tweak-mode': mode}}
				onFocus={() => {
					multi.setFocusing(true)
					onFocus?.()
				}}
				onBlur={() => {
					multi.setFocusing(false)
					onBlur?.()
				}}
			>
				<SvgIcon mode="block" className={styles.rotary}>
					<circle className={styles.circle} cx="16" cy="16" r="16" />
					<g
						style={{
							transformOrigin: '16px 16px',
							transform: `rotate(${value + angleOffset}deg)`,
						}}
						onPointerEnter={() => setPointerMode('absolute')}
						onPointerLeave={() => !drag.dragging && setPointerMode('relative')}
					>
						<path
							className={styles.absoluteModeArea}
							d="M 16 16 L 16 32 A 16 16 0 0 0 16 0 Z"
						/>
						<path className={styles.tip} d="M20 16 L30 16" />
					</g>
				</SvgIcon>
			</button>
			{drag.dragging && (
				<TweakOverlay>
					<div className={styles.overlay}>
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
								className={classNames(
									styles.thin,
									styles.gray,
									shouldSnap && styles.snap
								)}
								d={metersPath}
							/>
							<path
								className={styles.bold}
								d={overlayPath}
								markerEnd={
									mode === 'relative' ? `url(#${markerId})` : undefined
								}
							/>
							<path className={styles.bold} d={activeMeterPath} />
						</svg>
						<Tooltip
							className={styles.overlayLabel}
							style={{left: labelPosition[0], top: labelPosition[1]}}
						>
							{display}
						</Tooltip>
					</div>
				</TweakOverlay>
			)}
		</>
	)
}
