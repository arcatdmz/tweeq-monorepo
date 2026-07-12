import {appConfigStore} from '@tweeq/dom'
import {
	type HTMLAttributes,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'

import {classNames} from '../../classNames'
import {useConfigRef} from '../../hooks'
import styles from './Tabs.module.styl'
import {type TabRegistration, TabsContext} from './TabsContext'

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	vertical?: boolean
	options?: {storageKey?: string; defaultTabId?: string}
	beforeTablist?: ReactNode
	onChanged?: (tab: TabRegistration) => void
	onClicked?: (tab: TabRegistration) => void
}

export function Tabs({
	name,
	vertical = false,
	options,
	beforeTablist,
	onChanged,
	onClicked,
	children,
	className,
	...props
}: TabsProps) {
	const entry = useMemo(
		() =>
			appConfigStore
				.getState()
				.ref<string | null>(options?.storageKey ?? `${name}.active`, null),
		[name, options?.storageKey]
	)
	const [persistedId, setPersistedId] = useConfigRef(entry)
	const [tabs, setTabs] = useState<TabRegistration[]>([])
	const [activeId, setActiveId] = useState('')
	const register = useCallback((tab: TabRegistration) => {
		setTabs(current =>
			current.some(item => item.id === tab.id) ? current : [...current, tab]
		)
		return () => setTabs(current => current.filter(item => item.id !== tab.id))
	}, [])
	const update = useCallback((tab: TabRegistration) => {
		setTabs(current => current.map(item => (item.id === tab.id ? tab : item)))
	}, [])

	const select = useCallback(
		(id: string, event?: MouseEvent) => {
			const selected = tabs.find(tab => tab.id === id)
			if (!selected) return
			if (event && selected.isDisabled) {
				event.preventDefault()
				return
			}
			if (activeId === selected.id) {
				onClicked?.(selected)
				return
			}
			setActiveId(selected.id)
			setPersistedId(selected.id)
			onChanged?.(selected)
		},
		[activeId, onChanged, onClicked, setPersistedId, tabs]
	)

	useEffect(() => {
		if (!tabs.length) return
		if (activeId && tabs.some(tab => tab.id === activeId)) return
		const next =
			(persistedId && tabs.some(tab => tab.id === persistedId)
				? persistedId
				: undefined) ??
			(options?.defaultTabId &&
			tabs.some(tab => tab.id === options.defaultTabId)
				? options.defaultTabId
				: tabs[0].id)
		select(next)
	}, [activeId, options?.defaultTabId, persistedId, select, tabs])

	const context = useMemo(
		() => ({activeId, register, update}),
		[activeId, register, update]
	)

	return (
		<TabsContext.Provider value={context}>
			<div
				{...props}
				className={classNames(
					'TqTabs',
					styles.tabs,
					vertical && styles.vertical,
					className
				)}
			>
				<div className={styles.tablistWrapper}>
					{beforeTablist && <div>{beforeTablist}</div>}
					<ul role="tablist" className={styles.tablist}>
						{tabs.map(tab => (
							<li
								key={tab.id}
								role="presentation"
								className={classNames(
									styles.tablistItem,
									tab.isDisabled && styles.disabled,
									tab.id === activeId && styles.active
								)}
							>
								<button
									type="button"
									role="tab"
									aria-controls={tab.paneId}
									aria-selected={tab.id === activeId}
									disabled={tab.isDisabled}
									className={styles.tablistLink}
									onClick={event => select(tab.id, event)}
								>
									{tab.name}
								</button>
							</li>
						))}
					</ul>
				</div>
				<div className={styles.panelsWrapper}>{children}</div>
			</div>
		</TabsContext.Provider>
	)
}
