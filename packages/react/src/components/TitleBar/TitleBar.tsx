import type {MenuItem} from '@tweeq/core'
import {type ActionItem, actionsStore} from '@tweeq/dom'
import {type HTMLAttributes, type ReactNode, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {classNames} from '../../classNames'
import {ColorIcon} from '../ColorIcon'
import {Menu} from '../Menu'
import {Popover} from '../Popover'
import styles from './TitleBar.module.styl'

export interface TitleBarProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	icon: string
	left?: ReactNode
	center?: ReactNode
	right?: ReactNode
}

function toMenuItem(item: MenuItem): MenuItem {
	if ('separator' in item) return item
	if ('perform' in item) {
		return {...item, bindIcon: (item as ActionItem).bind?.icon}
	}
	return {...item, children: item.children.map(toMenuItem)}
}

export function TitleBar({
	name,
	icon,
	left,
	center,
	right,
	className,
	...props
}: TitleBarProps) {
	const appIcon = useRef<HTMLDivElement>(null)
	const menu = useStore(actionsStore, state => state.menu)
	const [menuShown, setMenuShown] = useState(false)
	const [focusWithin, setFocusWithin] = useState(false)

	return (
		<div
			{...props}
			className={classNames(
				styles.titleBar,
				(menuShown || focusWithin) && styles.noDrag,
				className
			)}
			onFocus={() => setFocusWithin(true)}
			onBlur={event => {
				if (!event.currentTarget.contains(event.relatedTarget))
					setFocusWithin(false)
			}}
		>
			<div className={styles.left}>
				<ColorIcon
					ref={appIcon}
					className={classNames(styles.appIcon, menuShown && styles.shown)}
					src={icon}
					role="button"
					tabIndex={0}
					aria-label={`${name} menu`}
					onClick={() => setMenuShown(current => !current)}
					onKeyDown={event => {
						if (event.key === 'Enter' || event.key === ' ')
							setMenuShown(current => !current)
					}}
				/>
				<Popover
					reference={appIcon.current}
					placement="bottom-start"
					open={menuShown}
					onChangeOpen={setMenuShown}
				>
					<Menu
						items={menu.map(toMenuItem)}
						onClose={() => setMenuShown(false)}
					/>
				</Popover>
				<span className={styles.appName}>{name}</span>
				{left}
			</div>
			<div className={styles.center}>{center}</div>
			<div className={styles.right}>{right}</div>
		</div>
	)
}
