import {resolveActiveTabId} from '@tweeq/core'
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
import {useTweeqRuntime} from '../../runtime'
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
	const {appConfigStore} = useTweeqRuntime()
	const entry = useMemo(
		() =>
			appConfigStore
				.getState()
				.ref<string | null>(options?.storageKey ?? `${name}.active`, null),
		[appConfigStore, name, options?.storageKey]
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
			if (selected.isDisabled) {
				event?.preventDefault()
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
		const next = resolveActiveTabId(
			tabs,
			activeId,
			persistedId,
			options?.defaultTabId
		)
		if (next && next !== activeId) select(next)
		else if (!next && activeId) setActiveId('')
	}, [activeId, options?.defaultTabId, persistedId, select, tabs])

	const context = useMemo(
		() => ({activeId, register, update}),
		[activeId, register, update]
	)

	return (
		<TabsContext.Provider value={context}>
			<div
				{...props}
				className={classNames('TqTabs', className)}
				data-tq-component="tabs"
				data-tq-orientation={vertical ? 'vertical' : 'horizontal'}
				data-tq-part="root"
			>
				<div data-tq-part="tablist-wrapper">
					{beforeTablist && <div data-tq-part="before-tablist">{beforeTablist}</div>}
					<ul
						role="tablist"
						aria-orientation={vertical ? 'vertical' : 'horizontal'}
						data-tq-part="tablist"
					>
						{tabs.map(tab => (
							<li
								key={tab.id}
								role="presentation"
								data-tq-part="tablist-item"
								data-tq-disabled={tab.isDisabled ? '' : undefined}
								data-tq-active={tab.id === activeId ? '' : undefined}
							>
								<button
									type="button"
									role="tab"
									aria-controls={tab.paneId}
									aria-selected={tab.id === activeId}
									disabled={tab.isDisabled}
									data-tq-tab=""
									data-tq-part={`tab-${tab.id}`}
									onClick={event => select(tab.id, event)}
								>
									{tab.name}
								</button>
							</li>
						))}
					</ul>
				</div>
				<div data-tq-part="panels-wrapper">{children}</div>
			</div>
		</TabsContext.Provider>
	)
}
