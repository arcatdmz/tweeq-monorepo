import {
	advanceDrumDragIndex,
	clampDrumIndex,
	consumeDrumWheel,
	DRUM_DRAG_STEP_PX,
	findDrumTypeAheadIndex,
	getDrumCellWidth,
	getDrumClickOffset,
	getLabelizer,
	type InputBoxProps,
	type InputEvents,
	type InputFont,
	type LabelizerProps,
} from '@tweeq/core'
import type {DragState} from '@tweeq/dom'
import {
	type HTMLAttributes,
	type KeyboardEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
	type WheelEvent,
} from 'react'

import {useDrag, useElementBounding, useResizeObserver} from '../../hooks'

export interface InputDrumProps<T>
	extends LabelizerProps<T>,
		InputBoxProps,
		InputEvents,
		Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: T
	onChange?: (value: T) => void
	font?: InputFont
	cellWidth?: number
}

export function InputDrum<T>({
	value,
	onChange,
	options,
	labels,
	labelizer,
	prefix,
	suffix,
	font,
	cellWidth: cellWidthProp,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputDrumProps<T>) {
	const root = useRef<HTMLDivElement>(null)
	const measureRoot = useRef<HTMLDivElement>(null)
	const {width: viewportWidth} = useElementBounding(root)
	const [measuredWidth, setMeasuredWidth] = useState(0)
	const [emPx, setEmPx] = useState(16)
	const [floatIndex, setFloatIndex] = useState(0)
	const floatIndexRef = useRef(0)
	const [animating, setAnimating] = useState(false)
	const animationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	)
	const typeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	const typeBuffer = useRef('')
	const wheelAccum = useRef(0)
	const makeLabel = useMemo(
		() => getLabelizer({options, labels, labelizer, prefix, suffix}),
		[labelizer, labels, options, prefix, suffix]
	)
	const completeOptions = useMemo(
		() => options.map(option => ({value: option, label: makeLabel(option)})),
		[makeLabel, options]
	)
	const activeIndex = options.findIndex(option => Object.is(option, value))
	const cellWidth = getDrumCellWidth({
		cellWidth: cellWidthProp,
		measuredLabelWidth: measuredWidth,
		viewportWidth,
		emPx,
	})
	const stateRef = useRef({
		value,
		options,
		activeIndex,
		viewportWidth,
		cellWidth,
		disabled,
		onChange,
		onConfirm,
	})
	stateRef.current = {
		value,
		options,
		activeIndex,
		viewportWidth,
		cellWidth,
		disabled,
		onChange,
		onConfirm,
	}

	const measure = () => {
		const element = measureRoot.current
		if (!element) return
		setEmPx(parseFloat(getComputedStyle(element).fontSize) || 16)
		setMeasuredWidth(
			Math.max(
				0,
				...Array.from(element.children).map(
					child => (child as HTMLElement).offsetWidth
				)
			)
		)
	}
	useResizeObserver(measureRoot, measure)
	useEffect(measure, [completeOptions])
	useEffect(
		() => () => {
			clearTimeout(animationTimer.current)
			clearTimeout(typeTimer.current)
		},
		[]
	)

	const triggerAnimation = () => {
		setAnimating(true)
		clearTimeout(animationTimer.current)
		animationTimer.current = setTimeout(() => setAnimating(false), 250)
	}
	const setIndex = (index: number) => {
		const current = stateRef.current
		if (current.options.length === 0) return
		const clamped = clampDrumIndex(index, current.options.length)
		const next = current.options[clamped]
		if (!Object.is(next, current.value)) {
			current.onChange?.(next)
		}
	}

	const dragOptions = useMemo(
		() => ({
			disabled: () => Boolean(stateRef.current.disabled),
			lockPointer: true,
			onDragStart() {
				const index = Math.max(0, stateRef.current.activeIndex)
				floatIndexRef.current = index
				setFloatIndex(index)
			},
			onDrag(state: DragState) {
				const next = advanceDrumDragIndex(
					floatIndexRef.current,
					state.delta[0],
					stateRef.current.options.length,
					DRUM_DRAG_STEP_PX
				)
				floatIndexRef.current = next
				setFloatIndex(next)
				setIndex(Math.round(next))
			},
			onDragEnd() {
				triggerAnimation()
				stateRef.current.onConfirm?.()
			},
			onClick(state: DragState) {
				const element = root.current
				if (!element) return
				const x = state.xy[0] - element.getBoundingClientRect().left
				const offset = getDrumClickOffset(
					x,
					stateRef.current.viewportWidth,
					stateRef.current.cellWidth
				)
				if (offset) setIndex(stateRef.current.activeIndex + offset)
			},
		}),
		[]
	)
	const drag = useDrag(root, dragOptions)

	useEffect(() => {
		if (!drag.dragging) triggerAnimation()
	}, [value])

	const displayIndex = drag.dragging ? floatIndex : Math.max(0, activeIndex)
	const transform = viewportWidth / 2 - cellWidth * (displayIndex + 0.5)

	const handleWheel = (event: WheelEvent) => {
		if (disabled) return
		event.preventDefault()
		const consumed = consumeDrumWheel(
			wheelAccum.current,
			event.deltaX || event.deltaY
		)
		wheelAccum.current = consumed.remainder
		if (consumed.steps) setIndex(stateRef.current.activeIndex + consumed.steps)
	}
	const handleKeyDown = (event: KeyboardEvent) => {
		if (disabled) return
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault()
			event.stopPropagation()
			setIndex(activeIndex - 1)
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault()
			event.stopPropagation()
			setIndex(activeIndex + 1)
		} else if (
			event.key.length === 1 &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey
		) {
			clearTimeout(typeTimer.current)
			typeTimer.current = setTimeout(() => (typeBuffer.current = ''), 800)
			typeBuffer.current += event.key.toLowerCase()
			const index = findDrumTypeAheadIndex(
				completeOptions.map(option => option.label),
				typeBuffer.current
			)
			if (index >= 0) {
				event.stopPropagation()
				setIndex(index)
			}
		}
	}

	return (
		<div
			{...props}
			ref={root}
			className={className}
			style={
				{
					'--cell-width': `${cellWidth}px`,
					'--label-width': `${measuredWidth}px`,
				} as React.CSSProperties
			}
			inline-position={inlinePosition}
			block-position={blockPosition}
			aria-invalid={invalid || undefined}
			tabIndex={disabled ? -1 : 0}
			data-tq-component="input-drum"
			data-tq-disabled={disabled ? '' : undefined}
			data-tq-part="root"
			onKeyDown={handleKeyDown}
			onWheel={handleWheel}
			onFocus={onFocus}
			onBlur={onBlur}
		>
			<span data-tq-part="center-mark" />
			<div data-tq-part="viewport">
				<div
					data-tq-part="track"
					style={{
						transform: `translateX(${transform}px)`,
						transition: drag.dragging || !animating ? 'none' : undefined,
					}}
				>
					{completeOptions.map((option, index) => (
						<div
							key={`${option.label}-${index}`}
							data-tq-cell=""
							data-tq-active={index === activeIndex ? '' : undefined}
							data-tq-numeric={font === 'numeric' ? '' : undefined}
							data-tq-part={index === activeIndex ? 'active-cell' : 'cell'}
						>
							{option.label}
							<span data-tq-part="tick" />
						</div>
					))}
				</div>
			</div>
			<div ref={measureRoot} data-tq-part="measure" aria-hidden="true">
				{completeOptions.map((option, index) => (
					<span
						key={`${option.label}-${index}`}
						data-tq-measure-item=""
						data-tq-numeric={font === 'numeric' ? '' : undefined}
					>
						{option.label}
					</span>
				))}
			</div>
		</div>
	)
}
