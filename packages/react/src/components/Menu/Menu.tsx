import {
	isPointInTriangle,
	type MenuItem,
	moveMenuFocus,
	type Point,
} from '@tweeq/core'
import {
	forwardRef,
	type KeyboardEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import {useStore} from 'zustand'

import {useTweeqRuntime} from '../../runtime'
import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'
import {Popover} from '../Popover'

export interface MenuProps {
	items: MenuItem[]
	onClose?: () => void
	autoFocus?: boolean
	onReturnToParent?: () => void
}

export interface MenuHandle {
	getRoot(): HTMLUListElement | null
}

export const Menu = forwardRef<MenuHandle, MenuProps>(function MenuComponent(
	{items, onClose, autoFocus = false, onReturnToParent},
	forwardedRef
) {
	const {themeStore} = useTweeqRuntime()
	const popupPadding = useStore(themeStore, state => state.popupPadding)
	const [hoverIndex, setHoverIndex] = useState(-1)
	const [candidateIndex, setCandidateIndex] = useState(-1)
	const [focusIndex, setFocusIndex] = useState(
		() => moveMenuFocus(items, -1, 'Home') ?? -1
	)
	const [keyboardSubmenuIndex, setKeyboardSubmenuIndex] = useState(-1)
	const root = useRef<HTMLUListElement>(null)
	const itemElements = useRef<(HTMLLIElement | null)[]>([])
	const childMenu = useRef<MenuHandle>(null)
	const pointer = useRef<Point>({x: 0, y: 0})
	const previousPointer = useRef<Point>({x: 0, y: 0})

	useImperativeHandle(forwardedRef, () => ({getRoot: () => root.current}), [])

	const focusItem = useCallback((index: number) => {
		setFocusIndex(index)
		itemElements.current[index]?.focus()
	}, [])

	useEffect(() => {
		const item = items[focusIndex]
		if (item && !('separator' in item) && !item.disabled) return
		setFocusIndex(moveMenuFocus(items, -1, 'Home') ?? -1)
	}, [focusIndex, items])

	useEffect(() => {
		if (autoFocus && focusIndex !== -1) focusItem(focusIndex)
	}, [autoFocus, focusIndex, focusItem])

	const hoveredItem = items[hoverIndex]
	const childItems =
		hoveredItem && 'children' in hoveredItem ? hoveredItem.children : undefined
	const childReference =
		hoverIndex === -1 ? null : itemElements.current[hoverIndex]

	const submenuIsOpen = () => Boolean(childItems)
	const submenuEdge = (): {c1: Point; c2: Point} | null => {
		const element = childMenu.current?.getRoot()
		if (!element) return null
		const rect = element.getBoundingClientRect()
		const edgeX = rect.left >= pointer.current.x ? rect.left : rect.right
		return {
			c1: {x: edgeX, y: rect.top},
			c2: {x: edgeX, y: rect.bottom},
		}
	}
	const headingToSubmenu = (at: Point) => {
		const edge = submenuEdge()
		return Boolean(
			edge && isPointInTriangle(at, previousPointer.current, edge.c1, edge.c2)
		)
	}

	const onItemEnter = (index: number, event: PointerEvent) => {
		const item = items[index]
		if (!item || (!('separator' in item) && item.disabled)) return
		setFocusIndex(index)
		setKeyboardSubmenuIndex(-1)
		setCandidateIndex(index)
		pointer.current = {x: event.clientX, y: event.clientY}
		if (!submenuIsOpen() || !headingToSubmenu(pointer.current)) {
			setHoverIndex(index)
		}
	}

	const openSubmenu = (index: number) => {
		const item = items[index]
		if (!item || 'separator' in item || !('children' in item) || item.disabled) {
			return false
		}
		setHoverIndex(index)
		setCandidateIndex(index)
		setKeyboardSubmenuIndex(index)
		return true
	}

	const performItem = (item: MenuItem) => {
		if ('separator' in item || item.disabled) return
		if ('perform' in item && item.perform) {
			item.perform()
			onClose?.()
		}
	}

	const onItemKeyDown = (event: KeyboardEvent, index: number) => {
		const next = moveMenuFocus(items, index, event.key)
		if (next !== undefined) {
			event.preventDefault()
			event.stopPropagation()
			focusItem(next)
			return
		}
		if (event.key === 'ArrowRight') {
			if (openSubmenu(index)) {
				event.preventDefault()
				event.stopPropagation()
			}
			return
		}
		if (event.key === 'ArrowLeft' && onReturnToParent) {
			event.preventDefault()
			event.stopPropagation()
			onReturnToParent()
			return
		}
		if (event.key === 'Escape') {
			event.preventDefault()
			event.stopPropagation()
			onClose?.()
			return
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			event.stopPropagation()
			if (!openSubmenu(index)) performItem(items[index])
		}
	}

	const onPointerMove = (event: PointerEvent) => {
		pointer.current = {x: event.clientX, y: event.clientY}
		if (
			submenuIsOpen() &&
			!headingToSubmenu(pointer.current) &&
			candidateIndex !== -1 &&
			candidateIndex !== hoverIndex
		) {
			setHoverIndex(candidateIndex)
		}
		previousPointer.current = pointer.current
	}

	return (
		<>
			<ul
				ref={root}
				role="menu"
				aria-orientation="vertical"
				data-tq-component="menu"
				onPointerMove={onPointerMove}
				onPointerLeave={() => setCandidateIndex(-1)}
				data-tq-part="root"
			>
				{items.map((item, index) =>
					'separator' in item ? (
						<li
							key={`${index}_separator`}
							ref={element => {
								itemElements.current[index] = element
							}}
							data-tq-part="separator"
							role="separator"
						/>
					) : (
						<li
							key={`${index}_item`}
							ref={element => {
								itemElements.current[index] = element
							}}
							data-tq-active={
								index === hoverIndex && candidateIndex === index
									? ''
									: undefined
							}
							data-tq-submenu-open={
								index === hoverIndex &&
								candidateIndex !== index &&
								'children' in item
									? ''
									: undefined
							}
							role="menuitem"
							tabIndex={index === focusIndex && !item.disabled ? 0 : -1}
							aria-disabled={item.disabled || undefined}
							aria-haspopup={'children' in item ? 'menu' : undefined}
							aria-expanded={
								'children' in item ? index === hoverIndex : undefined
							}
							data-tq-disabled={item.disabled ? '' : undefined}
							onClick={() => performItem(item)}
							onFocus={() => setFocusIndex(index)}
							onKeyDown={event => onItemKeyDown(event, index)}
							onPointerEnter={event => onItemEnter(index, event)}
							data-tq-part="item"
						>
							{item.icon ? (
								<Icon data-tq-part="icon" icon={item.icon} />
							) : (
								<span />
							)}
							<div data-tq-part="label-container">
								<span data-tq-part="label">
									{item.shortLabel ?? item.label}
								</span>
								{'bindIcon' in item && item.bindIcon && (
									<BindIcon data-tq-part="bind-icon" icon={item.bindIcon} />
								)}
								{'children' in item && (
									<Icon
										data-tq-part="group-chevron"
										icon="mdi:chevron-right"
									/>
								)}
							</div>
						</li>
					)
				)}
			</ul>
			{childReference && childItems && (
				<Popover
					reference={childReference}
					placement="right-start"
					open
					offset={{crossAxis: -popupPadding}}
					lightDismiss={false}
				>
					<Menu
						ref={childMenu}
						items={childItems}
						onClose={onClose}
						autoFocus={keyboardSubmenuIndex === hoverIndex}
						onReturnToParent={() => {
							const parentIndex = hoverIndex
							setHoverIndex(-1)
							setCandidateIndex(-1)
							setKeyboardSubmenuIndex(-1)
							focusItem(parentIndex)
						}}
					/>
				</Popover>
			)}
		</>
	)
})
