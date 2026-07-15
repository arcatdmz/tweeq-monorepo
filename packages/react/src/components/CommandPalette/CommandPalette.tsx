import {
	moveCommandSelection,
	updateCommandHistory,
} from '@tweeq/core'
import {type ActionItem} from '@tweeq/dom'
import {search} from 'fast-fuzzy'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {useConfigRef, useEventListener} from '../../hooks'
import {useTweeqRuntime} from '../../runtime'
import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'

const ACTION_LIST_ID = 'tq-command-palette-actions'

function actionDomId(id: string) {
	return `tq-command-palette-action-${encodeURIComponent(id)}`
}

export function CommandPalette() {
	const {actionsStore, appConfigStore} = useTweeqRuntime()
	const historyEntry = useMemo(
		() =>
			appConfigStore
				.getState()
				.ref<string[]>('commandPalette.performedActionsHistory', []),
		[appConfigStore]
	)
	const root = useRef<HTMLDivElement>(null)
	const input = useRef<HTMLInputElement>(null)
	const allActions = useStore(actionsStore, state => state.allActions)
	const [history, setHistory] = useConfigRef(historyEntry)
	const [open, setOpen] = useState(false)
	const [nativePopover, setNativePopover] = useState<boolean | null>(null)
	const [query, setQuery] = useState('')
	const filtered = useMemo(() => {
		if (query === '' && open) {
			return history
				.map(id => allActions[id])
				.filter((action): action is ActionItem => action !== undefined)
		}
		return search(query, Object.values(allActions), {
			keySelector: action => action.label,
		})
	}, [allActions, history, open, query])
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const selected =
		filtered.find(action => action.id === selectedId) ?? filtered[0] ?? null

	useEventListener<ToggleEvent>(root, 'toggle', event => {
		setOpen(event.newState === 'open')
	})
	useEffect(() => {
		const element = root.current
		setNativePopover(
			typeof element?.togglePopover === 'function' &&
				typeof element.hidePopover === 'function'
		)
	}, [])
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			if (
				!(event.metaKey || event.ctrlKey) ||
				event.key.toLowerCase() !== 'p'
			) {
				return
			}
			event.preventDefault()
			const element = root.current
			if (typeof element?.togglePopover !== 'function') {
				setOpen(current => !current)
				return
			}
			try {
				element.togglePopover()
			} catch {
				setNativePopover(false)
				setOpen(current => !current)
			}
		}
	)
	useEffect(() => {
		setQuery('')
		setSelectedId(null)
		if (open) requestAnimationFrame(() => input.current?.focus())
	}, [open])

	const perform = (action: ActionItem) => {
		setHistory(current => updateCommandHistory(current, action.id))
		const element = root.current
		if (typeof element?.hidePopover === 'function') {
			try {
				element.hidePopover()
			} catch {
				setNativePopover(false)
				setOpen(false)
			}
		} else {
			setOpen(false)
		}
		void actionsStore.getState().perform(action.id)
	}

	return (
		<div
			ref={root}
			className="TqCommandPalette"
			popover="auto"
			data-tq-component="command-palette"
			data-tq-open={open ? '' : undefined}
			data-tq-popover-fallback={nativePopover === false ? '' : undefined}
			data-tq-part="root"
		>
			<div data-tq-part="search-container">
				<Icon
					icon="material-symbols:search-rounded"
					data-tq-part="search-icon"
				/>
				<input
					ref={input}
					type="text"
					placeholder="Search menus and commands"
					value={query}
					role="combobox"
					aria-autocomplete="list"
					aria-controls={ACTION_LIST_ID}
					aria-expanded={open}
					aria-activedescendant={
						selected ? actionDomId(selected.id) : undefined
					}
					data-tq-part="search"
					onChange={event => setQuery(event.currentTarget.value)}
					onKeyDown={event => {
						if (
							selected &&
							(event.key === 'ArrowDown' || event.key === 'ArrowUp')
						) {
							event.preventDefault()
							const index = filtered.indexOf(selected)
							const next = moveCommandSelection(
								index,
								event.key === 'ArrowDown' ? 1 : -1,
								filtered.length
							)
							setSelectedId(filtered[next].id)
						} else if (event.key === 'Enter' && selected) {
							perform(selected)
						}
					}}
				/>
			</div>
			{query === '' && filtered.length > 0 && (
				<div data-tq-part="recent-actions">Recent Actions</div>
			)}
			<ul id={ACTION_LIST_ID} role="listbox" data-tq-part="action-list">
				{filtered.map(action => (
					<li
						key={action.id}
						id={actionDomId(action.id)}
						role="option"
						aria-selected={action === selected}
						data-tq-selected={action === selected ? '' : undefined}
						data-tq-part="action"
						onPointerMove={() => setSelectedId(action.id)}
						onClick={() => perform(action)}
					>
						{action.icon ? (
							<Icon icon={action.icon} data-tq-part="action-icon" />
						) : (
							<span data-tq-part="action-icon" />
						)}
						<span data-tq-part="action-label">{action.label}</span>
						{action.bind?.icon && (
							<BindIcon
								icon={action.bind.icon}
								data-tq-part="action-bind-icon"
							/>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
