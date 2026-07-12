import {search} from 'fast-fuzzy'
import {
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {useStore} from 'zustand'

import {
	getDropdownTop,
	getLabelizer,
	type InputAlign,
	type InputBoxProps,
	type InputEvents,
	type InputFont,
	type InputTheme,
	type LabelizerProps,
	themeStore,
	unsignedMod,
} from '../../../core'
import {classNames} from '../../classNames'
import {useElementBounding, useWindowSize} from '../../hooks'
import {Icon} from '../Icon'
import {InputString, type InputStringHandle} from '../InputString'
import {Popover} from '../Popover'
import styles from './InputDropdown.module.styl'

export interface InputDropdownProps<T>
	extends LabelizerProps<T>,
		InputBoxProps,
		InputEvents,
		Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: T
	onChange?: (value: T) => void
	icons?: string[]
	theme?: InputTheme
	font?: InputFont
	align?: InputAlign
	renderOption?: (item: T, index: number) => ReactNode
}

export function InputDropdown<T>({
	value,
	onChange,
	options,
	labels,
	labelizer,
	prefix = '',
	suffix = '',
	icons,
	theme,
	font,
	align = 'center',
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	renderOption,
	className,
	...props
}: InputDropdownProps<T>) {
	const root = useRef<HTMLDivElement>(null)
	const input = useRef<InputStringHandle>(null)
	const select = useRef<HTMLUListElement>(null)
	const bounds = useElementBounding(root)
	const windowSize = useWindowSize()
	const inputHeight = useStore(themeStore, state => state.inputHeight)
	const [open, setOpen] = useState(false)
	const [edited, setEdited] = useState(false)
	const makeLabel = useMemo(
		() => getLabelizer({options, labels, labelizer, prefix, suffix}),
		[labelizer, labels, options, prefix, suffix]
	)
	const [display, setDisplay] = useState(() => makeLabel(value))
	const [valueAtStart, setValueAtStart] = useState(value)
	const [listHeight, setListHeight] = useState(0)
	const [dropdownTop, setDropdownTop] = useState(6)
	const [scrollState, setScrollState] = useState({up: false, down: false})
	const openedAt = useRef(0)
	const autoScrollFrame = useRef<number | undefined>(undefined)
	const valueRef = useRef(value)
	valueRef.current = value
	const filtered = useMemo(
		() =>
			display === '' || !edited
				? options
				: search(
						display,
						options.map(item => ({item, label: makeLabel(item)})),
						{keySelector: entry => entry.label}
					).map(entry => entry.item),
		[display, edited, makeLabel, options]
	)
	const currentIndex = options.indexOf(value)
	const currentIcon = currentIndex >= 0 ? icons?.[currentIndex] : undefined

	const measureAndPlace = () => {
		const height =
			select.current?.scrollHeight ?? options.length * inputHeight + 4
		setListHeight(height)
		setDropdownTop(
			getDropdownTop({
				triggerTop: bounds.top,
				selectedIndex: options.indexOf(valueAtStart),
				itemHeight: inputHeight,
				listHeight: height,
				viewportHeight: windowSize.height,
			})
		)
	}
	const updateArrows = () => {
		const element = select.current
		if (!element) return
		setScrollState({
			up: element.scrollTop > 0.5,
			down:
				element.scrollTop + element.clientHeight < element.scrollHeight - 0.5,
		})
	}

	useEffect(() => {
		if (!open) {
			setDisplay(makeLabel(value))
			setEdited(false)
			return
		}
		setValueAtStart(value)
		openedAt.current = performance.now()
		measureAndPlace()
		const frame = requestAnimationFrame(() => {
			measureAndPlace()
			const current =
				select.current?.querySelector<HTMLElement>('[data-current]')
			current?.scrollIntoView({block: 'nearest'})
			updateArrows()
		})
		const onPointerUp = () => {
			if (performance.now() - openedAt.current > 500) {
				setOpen(false)
				onConfirm?.()
				onBlur?.()
			} else input.current?.select()
		}
		window.addEventListener('pointerup', onPointerUp)
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('pointerup', onPointerUp)
		}
	}, [open])
	useEffect(() => {
		if (!open) setDisplay(makeLabel(value))
	}, [makeLabel, open, value])
	useEffect(() => {
		if (filtered.length && !filtered.includes(value)) onChange?.(filtered[0])
	}, [filtered])
	useEffect(
		() => () => {
			if (autoScrollFrame.current !== undefined) {
				cancelAnimationFrame(autoScrollFrame.current)
			}
		},
		[]
	)

	const startAutoScroll = (direction: -1 | 1) => {
		if (autoScrollFrame.current !== undefined) {
			cancelAnimationFrame(autoScrollFrame.current)
		}
		const step = () => {
			const element = select.current
			if (!element) return
			element.scrollTop += direction * 8
			updateArrows()
			autoScrollFrame.current = requestAnimationFrame(step)
		}
		autoScrollFrame.current = requestAnimationFrame(step)
	}
	const stopAutoScroll = () => {
		if (autoScrollFrame.current !== undefined) {
			cancelAnimationFrame(autoScrollFrame.current)
		}
		autoScrollFrame.current = undefined
	}
	const move = (direction: number) => {
		if (!filtered.length) return
		const index = filtered.indexOf(value)
		const next = filtered[unsignedMod(index + direction, filtered.length)]
		onChange?.(next)
		requestAnimationFrame(() =>
			select.current
				?.querySelector<HTMLElement>('[data-active]')
				?.scrollIntoView({block: 'nearest'})
		)
	}

	const placement: [number, number] = edited
		? [bounds.left - 2, bounds.bottom]
		: [bounds.left - 2, dropdownTop]
	const maxHeight = Math.min(
		listHeight || Infinity,
		windowSize.height - (edited ? bounds.bottom : dropdownTop) - 6
	)

	return (
		<div
			{...props}
			ref={root}
			className={classNames(
				styles.tqInputDropdown,
				open && styles.open,
				className
			)}
			{...{align}}
			aria-disabled={disabled || undefined}
		>
			<InputString
				ref={input}
				value={display}
				className={classNames(
					styles.field,
					currentIcon && !edited && styles.hideText
				)}
				theme={theme}
				font={font}
				align={align}
				inlinePosition={inlinePosition}
				blockPosition={blockPosition}
				disabled={disabled}
				invalid={invalid}
				onPointerDown={event => {
					if (event.isPrimary) setOpen(true)
				}}
				onFocus={() => {
					setOpen(true)
					onFocus?.()
				}}
				onBlur={() => {
					if (!open) onBlur?.()
				}}
				onChange={text => {
					setDisplay(text)
					setEdited(true)
					setOpen(true)
				}}
				onKeyDown={event => {
					if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
						event.preventDefault()
						move(event.key === 'ArrowUp' ? -1 : 1)
					} else if (event.key === 'Enter') {
						event.preventDefault()
						if (open) {
							setOpen(false)
							onConfirm?.()
							input.current?.blur()
						} else setOpen(true)
					} else if (event.key === 'Escape') {
						setOpen(false)
						onChange?.(valueAtStart)
					}
				}}
			/>
			{currentIcon && !edited && (
				<div
					className={classNames(
						styles.valueDisplay,
						font === 'numeric' && styles.numeric
					)}
				>
					<Icon className={styles.valueIcon} icon={currentIcon} />
					<span className={styles.valueLabel}>{makeLabel(value)}</span>
				</div>
			)}
			<Icon className={styles.chevron} icon="mdi:unfold-more-horizontal" />
			<Popover
				open={open}
				reference={root.current}
				placement={placement}
				lightDismiss={false}
				onChangeOpen={next => {
					if (!next && open) {
						setOpen(false)
						onChange?.(valueAtStart)
					}
				}}
			>
				<div className={styles.selectWrapper} style={{width: bounds.width + 2}}>
					<ul
						ref={select}
						className={styles.select}
						role="listbox"
						style={{maxHeight}}
						{...{font, align}}
						onScroll={updateArrows}
					>
						{filtered.map((item, index) => (
							<li
								key={index}
								role="option"
								aria-selected={Object.is(item, value)}
								className={classNames(
									styles.option,
									Object.is(item, value) && styles.active,
									Object.is(item, valueAtStart) && styles.current
								)}
								data-active={Object.is(item, value) || undefined}
								data-current={Object.is(item, valueAtStart) || undefined}
								onPointerEnter={() => onChange?.(item)}
								onClick={() => {
									onChange?.(item)
									setOpen(false)
									onConfirm?.()
								}}
							>
								{renderOption?.(item, index) ?? (
									<>
										{icons?.[options.indexOf(item)] && (
											<Icon icon={icons[options.indexOf(item)]} />
										)}
										{makeLabel(item)}
									</>
								)}
							</li>
						))}
					</ul>
					{scrollState.up && (
						<div
							className={`${styles.scrollArrow} ${styles.top}`}
							onPointerEnter={() => startAutoScroll(-1)}
							onPointerLeave={stopAutoScroll}
						>
							<Icon icon="mdi:chevron-up" />
						</div>
					)}
					{scrollState.down && (
						<div
							className={`${styles.scrollArrow} ${styles.bottom}`}
							onPointerEnter={() => startAutoScroll(1)}
							onPointerLeave={stopAutoScroll}
						>
							<Icon icon="mdi:chevron-down" />
						</div>
					)}
				</div>
			</Popover>
		</div>
	)
}
