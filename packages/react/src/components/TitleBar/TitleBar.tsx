import {actionsStore, decorateActionMenuItems} from '@tweeq/dom'
import {type HTMLAttributes, type ReactNode, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {ColorIcon} from '../ColorIcon'
import {Menu} from '../Menu'
import {Popover} from '../Popover'

export interface TitleBarProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	icon: string
	left?: ReactNode
	center?: ReactNode
	right?: ReactNode
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
			className={className}
			data-tq-component="title-bar"
			data-tq-no-drag={menuShown || focusWithin ? '' : undefined}
			onFocus={() => setFocusWithin(true)}
			data-tq-part="root"
			onBlur={event => {
				if (!event.currentTarget.contains(event.relatedTarget))
					setFocusWithin(false)
			}}
		>
			<div data-tq-part="left">
				<ColorIcon
					ref={appIcon}
					src={icon}
					role="button"
					tabIndex={0}
					aria-label={`${name} menu`}
					aria-expanded={menuShown}
					data-tq-part="menu-trigger"
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
						items={decorateActionMenuItems(menu)}
						onClose={() => setMenuShown(false)}
					/>
				</Popover>
				<span data-tq-part="app-name">{name}</span>
				{left}
			</div>
			<div data-tq-part="center">{center}</div>
			<div data-tq-part="right">{right}</div>
		</div>
	)
}
