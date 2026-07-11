import {
	type HTMLAttributes,
	type PointerEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import {
	getLabelizer,
	type InputEvents,
	type LabelizerProps,
} from '../../../core'
import {classNames} from '../../classNames'
import {useEventListener, useResizeObserver} from '../../hooks'
import {Icon} from '../Icon'
import {useTooltip} from '../Tooltip'
import styles from './InputRadio.module.styl'

type RadioMode = 'rowFull' | 'rowIcon' | 'colFull' | 'colIcon'

interface IndicatorRect {
	left: number
	top: number
	width: number
	height: number
}

export interface InputRadioProps<T>
	extends LabelizerProps<T>,
		InputEvents,
		Omit<HTMLAttributes<HTMLUListElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: T
	onChange?: (value: T) => void
	icons?: string[]
	tooltips?: string[]
	renderOption?: (option: {
		label: string
		value: T
		isActive: boolean
	}) => ReactNode
}

export function InputRadio<T>({
	value,
	onChange,
	options,
	labels,
	labelizer,
	prefix,
	suffix,
	icons,
	tooltips,
	renderOption,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputRadioProps<T>) {
	const id = useId()
	const root = useRef<HTMLUListElement>(null)
	const [mode, setMode] = useState<RadioMode>('rowFull')
	const [indicator, setIndicator] = useState<IndicatorRect | null>(null)
	const [animating, setAnimating] = useState(false)
	const [dragging, setDragging] = useState(false)
	const draggingRef = useRef(false)
	const animationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	)
	const makeLabel = useMemo(
		() => getLabelizer({options, labels, labelizer, prefix, suffix}),
		[labelizer, labels, options, prefix, suffix]
	)
	const completeOptions = useMemo(
		() => options.map(option => ({value: option, label: makeLabel(option)})),
		[makeLabel, options]
	)
	const activeIndex = completeOptions.findIndex(
		option => option.value === value
	)
	const hasIcons = Boolean(icons?.length)
	const vertical = mode === 'colFull' || mode === 'colIcon'
	const showLabel = mode === 'rowFull' || mode === 'colFull'
	const stateRef = useRef({completeOptions, value, vertical, activeIndex})
	stateRef.current = {completeOptions, value, vertical, activeIndex}

	const updateIndicator = useCallback(() => {
		const element = root.current
		if (!element) return
		const optionLabels =
			element.querySelectorAll<HTMLElement>('[data-radio-label]')
		const active = optionLabels[stateRef.current.activeIndex]
		if (!active) {
			setIndicator(null)
			return
		}
		const rootRect = element.getBoundingClientRect()
		const rect = active.getBoundingClientRect()
		setIndicator({
			left: rect.left - rootRect.left,
			top: rect.top - rootRect.top,
			width: rect.width,
			height: rect.height,
		})
	}, [])

	const updateLayout = useCallback(() => {
		const element = root.current
		if (!element || completeOptions.length === 0) return
		const computed = getComputedStyle(element)
		const unit = parseFloat(computed.getPropertyValue('--tq-input-height')) || 0
		const gap = parseFloat(computed.gap) || 0
		const rulers = element.querySelectorAll<HTMLElement>(
			'[data-radio-ruler-item]'
		)
		let sumFull = 0
		let maxFull = 0
		rulers.forEach(ruler => {
			const width = ruler.getBoundingClientRect().width
			sumFull += width
			maxFull = Math.max(maxFull, width)
		})
		if (sumFull === 0) return

		const gaps = gap * (completeOptions.length - 1)
		const fits = (width: number) => element.clientWidth + 1 >= width
		let next: RadioMode
		if (hasIcons) {
			if (fits(sumFull + gaps)) next = 'rowFull'
			else if (fits(unit * completeOptions.length + gaps)) next = 'rowIcon'
			else if (fits(maxFull)) next = 'colFull'
			else next = 'colIcon'
		} else {
			next = fits(sumFull + gaps) ? 'rowFull' : 'colFull'
		}
		setMode(next)
		requestAnimationFrame(updateIndicator)
	}, [completeOptions.length, hasIcons, updateIndicator])

	useResizeObserver(root, updateLayout)
	useLayoutEffect(updateLayout, [updateLayout])
	useLayoutEffect(updateIndicator, [activeIndex, mode, updateIndicator])
	useEffect(() => () => clearTimeout(animationTimer.current), [])

	const commit = (next: T) => {
		if (Object.is(next, stateRef.current.value)) return
		setAnimating(true)
		clearTimeout(animationTimer.current)
		animationTimer.current = setTimeout(() => setAnimating(false), 250)
		onChange?.(next)
		onConfirm?.()
	}

	const optionIndexAt = (clientX: number, clientY: number): number => {
		const element = root.current
		if (!element) return stateRef.current.activeIndex
		const optionLabels =
			element.querySelectorAll<HTMLElement>('[data-radio-label]')
		for (let i = 0; i < optionLabels.length; i++) {
			const rect = optionLabels[i].getBoundingClientRect()
			if (
				stateRef.current.vertical ? clientY < rect.bottom : clientX < rect.right
			) {
				return i
			}
		}
		return optionLabels.length - 1
	}
	const selectAt = (clientX: number, clientY: number) => {
		const option =
			stateRef.current.completeOptions[optionIndexAt(clientX, clientY)]
		if (option) commit(option.value)
	}

	useEventListener<globalThis.PointerEvent>(
		typeof window === 'undefined' ? null : window,
		'pointermove',
		event => {
			if (draggingRef.current) selectAt(event.clientX, event.clientY)
		}
	)
	const endDrag = () => {
		if (!draggingRef.current) return
		draggingRef.current = false
		setDragging(false)
	}
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'pointerup',
		endDrag
	)
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'pointercancel',
		endDrag
	)

	return (
		<ul
			{...props}
			ref={root}
			className={classNames(
				styles.tqInputRadio,
				styles[mode],
				vertical && styles.vertical,
				!showLabel && styles.iconOnly,
				className
			)}
			onPointerDown={(event: PointerEvent<HTMLUListElement>) => {
				if (event.button !== 0) return
				event.preventDefault()
				draggingRef.current = true
				setDragging(true)
				selectAt(event.clientX, event.clientY)
			}}
		>
			{indicator && (
				<div
					className={classNames(
						styles.indicator,
						animating && styles.animating,
						dragging && styles.dragging
					)}
					style={{
						transform: `translate(${indicator.left}px, ${indicator.top}px)`,
						width: indicator.width,
						height: indicator.height,
					}}
				/>
			)}
			{completeOptions.map((option, index) => {
				const active = Object.is(option.value, value)
				const tooltip =
					tooltips?.[index] ??
					(!showLabel && icons?.[index] ? option.label : undefined)
				return (
					<li key={`${option.label}-${index}`} className={styles.list}>
						<input
							id={`${id}-${index}`}
							type="radio"
							name={id}
							checked={active}
							onChange={() => commit(option.value)}
							onFocus={onFocus}
							onBlur={onBlur}
						/>
						<RadioLabel
							htmlFor={`${id}-${index}`}
							active={active}
							tooltip={tooltip}
						>
							{renderOption?.({
								label: option.label,
								value: option.value,
								isActive: active,
							}) ?? (
								<>
									{icons?.[index] && (
										<Icon className={styles.icon} icon={icons[index]} />
									)}
									{(showLabel || !icons?.[index]) && (
										<span className={styles.text}>{option.label}</span>
									)}
								</>
							)}
						</RadioLabel>
					</li>
				)
			})}
			<li className={styles.ruler} aria-hidden="true">
				{completeOptions.map((option, index) => (
					<div
						key={`${option.label}-${index}`}
						className={styles.rulerItem}
						data-radio-ruler-item=""
					>
						{icons?.[index] && (
							<Icon className={styles.icon} icon={icons[index]} />
						)}
						<span className={styles.text}>{option.label}</span>
					</div>
				))}
			</li>
		</ul>
	)
}

function RadioLabel({
	htmlFor,
	active,
	tooltip,
	children,
}: {
	htmlFor: string
	active: boolean
	tooltip?: string
	children: ReactNode
}) {
	const label = useRef<HTMLLabelElement>(null)
	useTooltip(label as RefObject<HTMLLabelElement>, tooltip)

	return (
		<label
			ref={label}
			htmlFor={htmlFor}
			className={active ? styles.active : undefined}
			data-radio-label=""
		>
			{children}
		</label>
	)
}
