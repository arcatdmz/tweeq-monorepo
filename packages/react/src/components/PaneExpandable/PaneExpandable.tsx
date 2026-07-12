import {type PopoverPlacement} from '@tweeq/core'
import {type HTMLAttributes, useEffect, useRef, useState} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {Popover} from '../Popover'
import styles from './PaneExpandable.module.styl'

export interface PaneExpandableProps extends HTMLAttributes<HTMLDivElement> {
	icon: string
	openIcon?: string
	open?: boolean
	onChangeOpen?: (open: boolean) => void
	onExpand?: () => void
	onCollapse?: () => void
	placement?: PopoverPlacement
	arrow?: boolean
	persistent?: boolean
}

export function PaneExpandable({
	icon,
	openIcon = 'mdi:close',
	open: controlledOpen,
	onChangeOpen,
	onExpand,
	onCollapse,
	placement = 'bottom-end',
	arrow = true,
	persistent = false,
	children,
	className,
	...props
}: PaneExpandableProps) {
	const button = useRef<HTMLButtonElement>(null)
	const [internalOpen, setInternalOpen] = useState(controlledOpen ?? false)
	const [hovering, setHovering] = useState(false)
	const lastDismissAt = useRef(Number.NEGATIVE_INFINITY)
	useEffect(() => {
		if (controlledOpen !== undefined) setInternalOpen(controlledOpen)
	}, [controlledOpen])
	const setOpen = (next: boolean) => {
		if (next === internalOpen) return
		if (controlledOpen === undefined) setInternalOpen(next)
		onChangeOpen?.(next)
		if (next) onExpand?.()
		else onCollapse?.()
	}

	return (
		<div {...props} className={classNames(styles.expandable, className)}>
			<button
				ref={button}
				type="button"
				aria-expanded={internalOpen}
				className={classNames(styles.button, internalOpen && styles.open)}
				onPointerEnter={() => {
					if (!persistent || internalOpen) setHovering(true)
					if (!persistent) setOpen(true)
				}}
				onPointerLeave={() => setHovering(false)}
				onClick={() => {
					if (performance.now() - lastDismissAt.current >= 200) {
						setHovering(true)
						setOpen(!internalOpen)
					}
				}}
			>
				<Icon
					className={styles.icon}
					icon={internalOpen && hovering ? openIcon : icon}
				/>
			</button>
			<Popover
				reference={button.current}
				open={internalOpen}
				placement={placement}
				arrow={arrow}
				lightDismiss={!persistent}
				exitTransition
				onChangeOpen={next => {
					if (!next) lastDismissAt.current = performance.now()
					setOpen(next)
				}}
			>
				<div className={styles.content}>{children}</div>
			</Popover>
		</div>
	)
}
