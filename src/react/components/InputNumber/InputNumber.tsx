import {scalar} from 'linearly'
import {
	type CSSProperties,
	forwardRef,
	type HTMLAttributes,
	type RefObject,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import {
	compileNumberExpression,
	type DragState,
	getInputNumberPrecision,
	type InputBoxProps,
	type InputEvents,
	type NumberScrubState,
	precisionOf,
	toFixed,
	toPercent,
	updateNumberScrub,
	validator as validators,
} from '../../../core'
import {classNames} from '../../classNames'
import {
	useDrag,
	useElementBounding,
	useKeys,
	useMultiSelect,
	useValidator,
} from '../../hooks'
import {Icon} from '../Icon'
import {InputTextBase, type InputTextBaseHandle} from '../InputTextBase'
import styles from './InputNumber.module.styl'
import {InputNumberScales} from './InputNumberScales'

const NUMBER_KEYS = ['Alt', 'Shift', 'q'] as const

export interface InputNumberProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			HTMLAttributes<HTMLDivElement>,
			'default' | 'onBlur' | 'onChange' | 'onFocus'
		> {
	value: number
	onChange?: (value: number) => void
	min?: number
	max?: number
	step?: number
	snap?: number
	bar?: number | boolean
	clampMin?: boolean
	clampMax?: boolean
	precision?: number
	prefix?: string
	suffix?: string
	leftIcon?: string
	rightIcon?: string
	default?: number
}

export interface InputNumberHandle {
	select(): void
	blur(): void
}

export const InputNumber = forwardRef<InputNumberHandle, InputNumberProps>(
	function InputNumberComponent(
		{
			value,
			onChange,
			min = Number.MIN_SAFE_INTEGER,
			max = Number.MAX_SAFE_INTEGER,
			step,
			snap = 10,
			bar = 0,
			clampMin = true,
			clampMax = true,
			precision: precisionLimit = 4,
			prefix = '',
			suffix = '',
			leftIcon,
			rightIcon,
			default: defaultValue,
			disabled,
			invalid: invalidProp,
			inlinePosition,
			blockPosition,
			onFocus,
			onBlur,
			onConfirm,
			className,
			...props
		},
		forwardedRef
	) {
		const base = useRef<InputTextBaseHandle>(null)
		const target = useMemo(
			() => ({
				get current() {
					return base.current?.getRoot() ?? null
				},
			}),
			[]
		) as RefObject<HTMLDivElement | null>
		const {left, right, width} = useElementBounding(target)
		const [local, setLocal] = useState(value)
		const [display, setDisplay] = useState('')
		const [focused, setFocused] = useState(false)
		const [expressionEnabled, setExpressionEnabled] = useState(false)
		const [expressionError, setExpressionError] = useState<string>()
		const [tweaking, setTweaking] = useState(false)
		const [gestureSpeed, setGestureSpeed] = useState(1)
		const [offsetWeight, setOffsetWeight] = useState(1)
		const [snapEnabled, setSnapEnabled] = useState(false)
		const keys = useKeys(NUMBER_KEYS)
		const valueRef = useRef(value)
		valueRef.current = value
		const localRef = useRef(local)
		localRef.current = local
		const focusedRef = useRef(focused)
		focusedRef.current = focused
		const tweakingRef = useRef(tweaking)
		tweakingRef.current = tweaking
		const gestureSpeedRef = useRef(gestureSpeed)
		gestureSpeedRef.current = gestureSpeed
		const snapEnabledRef = useRef(snapEnabled)
		snapEnabledRef.current = snapEnabled
		const keysRef = useRef(keys)
		keysRef.current = keys
		const boundsRef = useRef({left, right, width})
		boundsRef.current = {left, right, width}
		const propsRef = useRef({
			min,
			max,
			step,
			snap,
			bar,
			clampMin,
			clampMax,
			precisionLimit,
			disabled,
		})
		propsRef.current = {
			min,
			max,
			step,
			snap,
			bar,
			clampMin,
			clampMax,
			precisionLimit,
			disabled,
		}
		const callbacksRef = useRef({onChange, onFocus, onBlur, onConfirm})
		callbacksRef.current = {onChange, onFocus, onBlur, onConfirm}
		const localAtFocus = useRef(0)
		const lastExternalValue = useRef(value)

		const validMin = clampMin ? min : Number.MIN_SAFE_INTEGER
		const validMax = clampMax ? max : Number.MAX_SAFE_INTEGER
		const barVisible =
			bar !== false &&
			min !== Number.MIN_SAFE_INTEGER &&
			max !== Number.MAX_SAFE_INTEGER &&
			width > 0
		const speedMultiplierKey = (keys.Alt ? 0.1 : 1) * (keys.Shift ? snap : 1)
		const speed = speedMultiplierKey * gestureSpeed
		const currentPrecision = getInputNumberPrecision({
			step,
			display,
			width,
			min,
			max,
			tweaking,
			speed,
			precision: precisionLimit,
		})
		const print = (number: number) =>
			tweaking
				? number.toFixed(currentPrecision)
				: toFixed(number, currentPrecision)
		const printRef = useRef(print)
		printRef.current = print

		const getValidate = () => {
			const current = propsRef.current
			return validators.compose(
				validators.clamp(
					current.clampMin ? current.min : Number.MIN_SAFE_INTEGER,
					current.clampMax ? current.max : Number.MAX_SAFE_INTEGER
				),
				validators.quantize(current.step ?? 0),
				validators.quantize(snapEnabledRef.current ? current.snap : 0)
			)
		}
		const validate = useMemo(
			() => getValidate(),
			[clampMax, clampMin, max, min, snap, snapEnabled, step]
		)
		const {validateResult} = useValidator(local, validate)

		const applyLocal = (next: number, updateDisplay: boolean) => {
			setLocal(next)
			localRef.current = next
			if (updateDisplay) setDisplay(print(next))
			const result = getValidate()(next)
			if (result.value !== undefined && result.value !== valueRef.current) {
				callbacksRef.current.onChange?.(result.value)
			}
		}

		const multi = useMultiSelect({
			type: 'number',
			getElement: () => target.current,
			getSpeed: () =>
				barVisible && boundsRef.current.width > 0
					? (propsRef.current.max - propsRef.current.min) /
						boundsRef.current.width
					: 1,
			getValue: () => localRef.current,
			setValue: next => {
				const result = getValidate()(Number(next))
				if (result.value === undefined) return
				setLocal(result.value)
				localRef.current = result.value
				if (!focusedRef.current || tweakingRef.current) {
					setDisplay(print(result.value))
				}
				callbacksRef.current.onChange?.(result.value)
			},
			confirm: () => callbacksRef.current.onConfirm?.(),
		})
		const multiRef = useRef(multi)
		multiRef.current = multi
		const confirmRef = useRef<() => void>(() => {})

		const confirm = () => {
			onConfirm?.()
			multi.confirm()
			multi.capture()
			setExpressionEnabled(false)
			setExpressionError(undefined)
			queueMicrotask(() => {
				const current = valueRef.current
				setLocal(current)
				setDisplay(printRef.current(current))
			})
		}
		confirmRef.current = confirm

		const dragOptions = useMemo(() => {
			let deltaAccumulated = 0
			let dragStartedFocused = false
			let scrubState: NumberScrubState & {deltaValue: number} = {
				local: localRef.current,
				directionAverage: [1, 0] as [number, number],
				offsetWeight: 1,
				gestureSpeed: 1,
				deltaValue: 0,
			}

			return {
				lockPointer: () => {
					const current = propsRef.current
					return !(
						current.bar !== false &&
						current.min !== Number.MIN_SAFE_INTEGER &&
						current.max !== Number.MAX_SAFE_INTEGER &&
						boundsRef.current.width > 0
					)
				},
				disabled: () => Boolean(propsRef.current.disabled),
				shouldDrag(event: PointerEvent) {
					if (!focusedRef.current) return true
					return Boolean(
						(event.target as Element | null)?.closest('[data-number-scrub]')
					)
				},
				onClick() {
					base.current?.select()
				},
				onDragStart(state: DragState, event: PointerEvent) {
					const current = propsRef.current
					const currentBounds = boundsRef.current
					const currentBarVisible =
						current.bar !== false &&
						current.min !== Number.MIN_SAFE_INTEGER &&
						current.max !== Number.MAX_SAFE_INTEGER &&
						currentBounds.width > 0
					const grabbed = Boolean(
						(event.target as Element | null)?.closest('[data-number-scrub]')
					)
					dragStartedFocused = focusedRef.current
					if (
						currentBarVisible &&
						current.min <= valueRef.current &&
						valueRef.current <= current.max &&
						!grabbed
					) {
						const next = scalar.fit(
							state.xy[0],
							currentBounds.left,
							currentBounds.right,
							current.min,
							current.max
						)
						applyLocal(next, true)
						multiRef.current.update(() => next)
					}
					deltaAccumulated = 0
					scrubState = {
						local: localRef.current,
						directionAverage: [1, 0],
						offsetWeight: 1,
						gestureSpeed: 1,
						deltaValue: 0,
					}
					setGestureSpeed(1)
					setOffsetWeight(1)
					setTweaking(true)
					tweakingRef.current = true
					multiRef.current.setFocusing(true)
					if (!dragStartedFocused) callbacksRef.current.onFocus?.()
					multiRef.current.capture()
				},
				onDrag(state: DragState) {
					const current = propsRef.current
					const currentBounds = boundsRef.current
					const currentBarVisible =
						current.bar !== false &&
						current.min !== Number.MIN_SAFE_INTEGER &&
						current.max !== Number.MAX_SAFE_INTEGER &&
						currentBounds.width > 0
					const keySpeed =
						(keysRef.current.Alt ? 0.1 : 1) *
						(keysRef.current.Shift ? current.snap : 1)
					let minimumSpeed = 10 ** -current.precisionLimit
					if (current.step && currentBarVisible) {
						const stepCount = (current.max - current.min) / current.step
						minimumSpeed = 10 ** -precisionOf(currentBounds.width / stepCount)
					}
					scrubState = updateNumberScrub({
						state: scrubState,
						delta: state.delta,
						barVisible: currentBarVisible,
						min: current.min,
						max: current.max,
						width: currentBounds.width,
						step: current.step,
						speed: keySpeed * scrubState.gestureSpeed,
						minSpeed: minimumSpeed,
						maxSpeed: currentBarVisible ? 1 : 1000,
					})
					setGestureSpeed(scrubState.gestureSpeed)
					gestureSpeedRef.current = scrubState.gestureSpeed
					setOffsetWeight(scrubState.offsetWeight)
					setSnapEnabled(keysRef.current.q)
					snapEnabledRef.current = keysRef.current.q
					applyLocal(scrubState.local, true)
					deltaAccumulated += scrubState.deltaValue
					multiRef.current.update(other => Number(other) + deltaAccumulated)
				},
				onDragEnd() {
					setTweaking(false)
					tweakingRef.current = false
					multiRef.current.setFocusing(focusedRef.current)
					confirmRef.current()
					if (dragStartedFocused) queueMicrotask(() => base.current?.select())
					else callbacksRef.current.onBlur?.()
				},
			}
		}, [])
		useDrag(target, dragOptions)

		useEffect(() => {
			if (tweaking) {
				setSnapEnabled(keys.q)
				snapEnabledRef.current = keys.q
			}
		}, [keys.q, tweaking])
		useLayoutEffect(() => {
			if (Object.is(lastExternalValue.current, value)) return
			lastExternalValue.current = value
			if (value !== getValidate()(localRef.current).value) {
				setLocal(value)
				localRef.current = value
			}
			if (!focusedRef.current || tweakingRef.current) setDisplay(print(value))
		}, [value])
		useLayoutEffect(() => {
			if (!display) setDisplay(print(value))
		}, [])

		useImperativeHandle(
			forwardedRef,
			() => ({
				select: () => base.current?.select(),
				blur: () => base.current?.blur(),
			}),
			[]
		)

		const insideRange = min <= value && value <= max
		const belowRange = barVisible && value < min
		const aboveRange = barVisible && value > max
		const handleAtEdge = insideRange && (value <= min || value >= max)
		const normalizedValue = scalar.invlerp(min, max, value)
		const zoneLeft = scalar.clamp(normalizedValue, 0, 1)
		const origin = typeof bar === 'number' ? bar : 0
		const normalizedOrigin = scalar.invlerp(min, max, origin)
		const barLeft = Math.min(normalizedOrigin, normalizedValue)
		const barRight = 1 - Math.max(normalizedOrigin, normalizedValue)
		const steppedAndClamped =
			Boolean(step) &&
			clampMin &&
			clampMax &&
			min !== Number.MIN_SAFE_INTEGER &&
			max !== Number.MAX_SAFE_INTEGER

		return (
			<InputTextBase
				{...props}
				ref={base}
				className={classNames(
					styles.tqInputNumber,
					belowRange && styles.belowRange,
					aboveRange && styles.aboveRange,
					tweaking && styles.tweaking,
					className
				)}
				value={display}
				ignoreInput={!focused}
				active={multi.subfocus}
				font={expressionEnabled ? 'monospace' : 'numeric'}
				align="center"
				inlinePosition={inlinePosition}
				blockPosition={blockPosition}
				disabled={disabled}
				invalid={
					invalidProp ||
					(!tweaking &&
						(validateResult.log.length > 0 || Boolean(expressionError)))
				}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				default={defaultValue}
				onFocus={() => {
					setFocused(true)
					focusedRef.current = true
					multi.setFocusing(true)
					multi.capture()
					onFocus?.()
					queueMicrotask(() => base.current?.select())
				}}
				onBlur={() => {
					confirm()
					setFocused(false)
					focusedRef.current = false
					multi.setFocusing(false)
					onBlur?.()
				}}
				onChange={text => {
					setDisplay(text)
					if (!/^[0-9.]*$/.test(text) && !expressionEnabled) {
						localAtFocus.current = localRef.current
						setExpressionEnabled(true)
					}
					try {
						const expression = compileNumberExpression(text)
						const result = expression(localAtFocus.current, {i: multi.index})
						applyLocal(result, false)
						setExpressionError(undefined)
						multi.update(expression)
					} catch (error) {
						setExpressionError((error as Error).message)
					}
				}}
				onKeyDown={event => {
					if (event.metaKey && event.key === '=') {
						event.preventDefault()
						localAtFocus.current = localRef.current
						setExpressionEnabled(true)
					} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
						event.preventDefault()
						const direction = event.key === 'ArrowUp' ? 1 : -1
						let next = localRef.current
						if (step) next += step * direction * Math.max(1, speedMultiplierKey)
						else {
							let multiplier = speedMultiplierKey
							if (validMax - validMin <= 1) multiplier *= 0.1
							next = scalar.clamp(
								next + direction * multiplier,
								validMin,
								validMax
							)
						}
						applyLocal(next, true)
					}
				}}
				onConfirm={confirm}
				onReset={() => {
					if (defaultValue === undefined) return
					onChange?.(defaultValue)
					onConfirm?.()
				}}
				renderInactiveContent={() => (
					<div className={styles.displayAtInactive}>
						{prefix && <span className={styles.prefix}>{prefix}</span>}
						{display}
						{suffix && <span className={styles.suffix}>{suffix}</span>}
					</div>
				)}
				renderBack={() => (
					<>
						<div
							className={styles.bar}
							style={
								barVisible
									? {left: toPercent(barLeft), right: toPercent(barRight)}
									: {visibility: 'hidden'}
							}
						/>
						<InputNumberScales min={min} max={max} step={step} />
						{tweaking && !steppedAndClamped && (
							<svg className={styles.overlay}>
								{[0, 1, 2].map(offset => {
									const gesturePrecision = scalar.mod(
										-Math.log(gestureSpeed) / Math.log(10) + offset,
										3
									)
									return (
										<line
											key={offset}
											className={styles.scale}
											x1={-width / 2}
											x2={width / 2}
											style={
												{
													'--offset-weight': offsetWeight,
													'--gesture-precision': gesturePrecision,
													opacity: Math.pow(
														scalar.smoothstep(1, 2, gesturePrecision),
														0.5
													),
												} as CSSProperties
											}
										/>
									)
								})}
							</svg>
						)}
						<div
							className={classNames(styles.handle, styles.scrub)}
							data-number-scrub=""
							style={
								barVisible
									? {left: `calc((100% - 1px) * ${normalizedValue})`}
									: {visibility: 'hidden'}
							}
						/>
					</>
				)}
				renderFront={() => (
					<>
						{barVisible ? (
							insideRange ? (
								handleAtEdge ? (
									<ScrubZone edge position={zoneLeft} />
								) : (
									<>
										<ScrubZone top position={zoneLeft} />
										<ScrubZone bottom position={zoneLeft} />
									</>
								)
							) : (
								<>
									<ScrubZone top wide />
									<ScrubZone bottom wide />
								</>
							)
						) : (
							<div
								className={classNames(styles.scrub, styles.grip)}
								data-number-scrub=""
							>
								{!leftIcon && (
									<Icon
										className={styles.gripHint}
										icon="mdi:arrow-left-right"
									/>
								)}
							</div>
						)}
					</>
				)}
			/>
		)
	}
)

function ScrubZone({
	top,
	bottom,
	edge,
	wide,
	position,
}: {
	top?: boolean
	bottom?: boolean
	edge?: boolean
	wide?: boolean
	position?: number
}) {
	return (
		<div
			className={classNames(
				styles.scrubZone,
				styles.scrub,
				top && styles.top,
				bottom && styles.bottom,
				edge && styles.edge,
				wide && styles.wide
			)}
			data-number-scrub=""
			style={
				position === undefined
					? undefined
					: {
							left: `clamp(0px, calc((100% - 1px) * ${position} - var(--tq-input-height) / 2), calc(100% - var(--tq-input-height)))`,
						}
			}
		/>
	)
}
