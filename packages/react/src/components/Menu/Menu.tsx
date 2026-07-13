import {
	isPointInTriangle,
	type MenuItem,
	type Point,
} from '@tweeq/core'
import {themeStore} from '@tweeq/dom'
import {
	forwardRef,
	type PointerEvent,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import {useStore} from 'zustand'

import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'
import {Popover} from '../Popover'

export interface MenuProps {
	items: MenuItem[]
	onClose?: () => void
}

export interface MenuHandle {
	getRoot(): HTMLUListElement | null
}

export const Menu = forwardRef<MenuHandle, MenuProps>(function MenuComponent(
	{items, onClose},
	forwardedRef
) {
	const popupPadding = useStore(themeStore, state => state.popupPadding)
	const [hoverIndex, setHoverIndex] = useState(-1)
	const [candidateIndex, setCandidateIndex] = useState(-1)
	const root = useRef<HTMLUListElement>(null)
	const itemElements = useRef<(HTMLLIElement | null)[]>([])
	const childMenu = useRef<MenuHandle>(null)
	const pointer = useRef<Point>({x: 0, y: 0})
	const previousPointer = useRef<Point>({x: 0, y: 0})

	useImperativeHandle(forwardedRef, () => ({getRoot: () => root.current}), [])

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
		setCandidateIndex(index)
		pointer.current = {x: event.clientX, y: event.clientY}
		if (!submenuIsOpen() || !headingToSubmenu(pointer.current)) {
			setHoverIndex(index)
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
							onClick={() => {
								if ('perform' in item && item.perform) {
									item.perform()
									onClose?.()
								}
							}}
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
					<Menu ref={childMenu} items={childItems} onClose={onClose} />
				</Popover>
			)}
		</>
	)
})
