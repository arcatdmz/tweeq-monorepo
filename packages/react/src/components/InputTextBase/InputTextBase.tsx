import {
	type InputAlign,
	type InputBoxProps,
	type InputFont,
	type InputTheme,
	type MenuItem,
} from '@tweeq/core'
import {
	type FocusEvent,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'

import {Icon} from '../Icon'
import {Menu} from '../Menu'
import {Popover} from '../Popover'

export interface InputTextBaseProps
	extends InputBoxProps,
		Omit<HTMLAttributes<HTMLDivElement>, 'default' | 'onChange'> {
	'data-tq-part'?: string
	value: string
	onChange?: (value: string) => void
	ignoreInput?: boolean
	hover?: boolean
	active?: boolean
	theme?: InputTheme
	font?: InputFont
	align?: InputAlign
	leftIcon?: string
	rightIcon?: string
	default?: unknown
	menuItems?: MenuItem[]
	onFocus?: (event: FocusEvent<HTMLInputElement>) => void
	onBlur?: (event: FocusEvent<HTMLInputElement>) => void
	onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
	onConfirm?: () => void
	onReset?: () => void
	onChangeFocused?: (focused: boolean) => void
	renderBack?: () => ReactNode
	renderFront?: () => ReactNode
	renderInactiveContent?: () => ReactNode
}

export interface InputTextBaseHandle {
	select(start?: number, end?: number): void
	blur(): void
	getRoot(): HTMLDivElement | null
	getInput(): HTMLInputElement | null
}

export const InputTextBase = forwardRef<
	InputTextBaseHandle,
	InputTextBaseProps
>(function InputTextBaseComponent(
	{
		value,
		onChange,
		ignoreInput = false,
		hover = false,
		active = false,
		theme,
		font,
		align,
		leftIcon,
		rightIcon,
		default: defaultValue,
		menuItems,
		disabled,
		invalid,
		inlinePosition,
		blockPosition,
		onFocus,
		onBlur,
		onKeyDown,
		onConfirm,
		onReset,
		onChangeFocused,
		renderBack,
		renderFront,
		renderInactiveContent,
		onContextMenu,
		className,
		'data-tq-part': part = 'root',
		...props
	},
	forwardedRef
) {
	const root = useRef<HTMLDivElement>(null)
	const input = useRef<HTMLInputElement>(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const [menuPosition, setMenuPosition] = useState<[number, number]>([0, 0])
	const hasInactiveContent = Boolean(renderInactiveContent)
	const contextMenuItems = useMemo<MenuItem[]>(() => {
		const items: MenuItem[] = []
		if (defaultValue !== undefined) {
			items.push({
				label: 'Reset to Default',
				icon: 'mdi:restore',
				perform: () => onReset?.(),
			})
		}
		if (menuItems?.length) {
			if (items.length) items.push({separator: true})
			items.push(...menuItems)
		}
		return items
	}, [defaultValue, menuItems, onReset])

	useImperativeHandle(
		forwardedRef,
		() => ({
			select(start, end) {
				if (start === undefined) input.current?.select()
				else {
					input.current?.setSelectionRange(start, end ?? start + 1)
					input.current?.focus()
				}
			},
			blur: () => input.current?.blur(),
			getRoot: () => root.current,
			getInput: () => input.current,
		}),
		[]
	)

	const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
		onContextMenu?.(event)
		if (event.defaultPrevented || contextMenuItems.length === 0) return
		event.preventDefault()
		setMenuPosition([event.clientX, event.clientY])
		setMenuOpen(true)
	}

	return (
		<div
			{...props}
			{...{
				theme,
				font,
				align,
				'inline-position': inlinePosition,
				'block-position': blockPosition,
			}}
			ref={root}
			className={className}
			data-tq-component="input-text-base"
			data-tq-active={active ? '' : undefined}
			data-tq-hover={hover ? '' : undefined}
			data-tq-invalid={invalid ? '' : undefined}
			onContextMenu={handleContextMenu}
			data-tq-part={part}
		>
			{renderBack?.()}
			<input
				ref={input}
				type="text"
				value={value}
				disabled={disabled || undefined}
				aria-invalid={invalid || undefined}
				data-tq-part="input"
				data-tq-ignore={ignoreInput ? '' : undefined}
				data-tq-has-inactive-content={
					hasInactiveContent ? '' : undefined
				}
				onFocus={event => {
					onChangeFocused?.(true)
					onFocus?.(event)
				}}
				onBlur={event => {
					onChangeFocused?.(false)
					onBlur?.(event)
				}}
				onChange={event => onChange?.(event.currentTarget.value)}
				onKeyDown={event => {
					if (
						!event.metaKey &&
						!event.ctrlKey &&
						event.key !== 'Escape' &&
						event.key !== 'Enter' &&
						event.key !== 'Tab'
					) {
						event.stopPropagation()
					}
					onKeyDown?.(event)
					if (event.key === 'Enter') onConfirm?.()
				}}
			/>
			{hasInactiveContent && (
				<div data-tq-part="inactive-content">
					{renderInactiveContent?.()}
				</div>
			)}
			{leftIcon && (
				<Icon
					data-tq-part="left-icon"
					icon={leftIcon}
				/>
			)}
			{rightIcon && (
				<Icon
					data-tq-part="right-icon"
					icon={rightIcon}
				/>
			)}
			{renderFront?.()}
			{menuOpen && (
				<Popover
					reference={root.current}
					placement={menuPosition}
					open={menuOpen}
					teleport=".TqViewport"
					onChangeOpen={setMenuOpen}
				>
					<Menu items={contextMenuItems} onClose={() => setMenuOpen(false)} />
				</Popover>
			)}
		</div>
	)
})
