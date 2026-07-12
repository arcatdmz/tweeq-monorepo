import {type HTMLAttributes, useContext, useEffect, useMemo} from 'react'

import {classNames} from '../../classNames'
import styles from './Tab.module.styl'
import {TabsContext} from './TabsContext'

export interface TabProps extends HTMLAttributes<HTMLElement> {
	id?: string
	name: string
	isDisabled?: boolean
}

export function Tab({
	id: idProp,
	name,
	isDisabled = false,
	className,
	children,
	...props
}: TabProps) {
	const context = useContext(TabsContext)
	if (!context) throw new Error('Tab must be rendered inside Tabs')
	const {activeId, register, update} = context
	const id = idProp ?? name.toLowerCase().replaceAll(' ', '-')
	const registration = useMemo(
		() => ({id, name, isDisabled, paneId: `${id}-pane`}),
		[id, isDisabled, name]
	)
	useEffect(() => register(registration), [register, registration])
	useEffect(() => update(registration), [registration, update])
	const active = activeId === id

	return (
		<section
			{...props}
			id={registration.paneId}
			className={classNames(
				'TqTab',
				styles.tab,
				active && styles.active,
				className
			)}
			data-tab-id={id}
			aria-hidden={!active}
			role="tabpanel"
			tabIndex={-1}
		>
			{children}
		</section>
	)
}
