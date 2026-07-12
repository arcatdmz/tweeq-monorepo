import './CommandPalette.global.styl'

import {search} from 'fast-fuzzy'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {
	type ActionItem,
	actionsStore,
	appConfigStore,
	unsignedMod,
} from '../../../core'
import {classNames} from '../../classNames'
import {useConfigRef, useEventListener} from '../../hooks'
import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'
import styles from './CommandPalette.module.styl'

const historyEntry = appConfigStore
	.getState()
	.ref<string[]>('commandPalette.performedActionsHistory', [])

export function CommandPalette() {
	const root = useRef<HTMLDivElement>(null)
	const input = useRef<HTMLInputElement>(null)
	const allActions = useStore(actionsStore, state => state.allActions)
	const [history, setHistory] = useConfigRef(historyEntry)
	const [open, setOpen] = useState(false)
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
			try {
				root.current?.togglePopover()
			} catch {
				// Native popover unavailable.
			}
		}
	)
	useEffect(() => {
		setQuery('')
		setSelectedId(null)
		if (open) requestAnimationFrame(() => input.current?.focus())
	}, [open])

	const perform = (action: ActionItem) => {
		setHistory(current => [...new Set([action.id, ...current])].slice(0, 10))
		root.current?.hidePopover()
		void action.perform()
	}

	return (
		<div
			ref={root}
			className={classNames('TqCommandPalette', styles.commandPalette)}
			popover="auto"
		>
			<div className={styles.searchContainer}>
				<Icon
					className={styles.searchIcon}
					icon="material-symbols:search-rounded"
				/>
				<input
					ref={input}
					className={styles.search}
					type="text"
					placeholder="Search menus and commands"
					value={query}
					onChange={event => setQuery(event.currentTarget.value)}
					onKeyDown={event => {
						if (
							selected &&
							(event.key === 'ArrowDown' || event.key === 'ArrowUp')
						) {
							event.preventDefault()
							const index = filtered.indexOf(selected)
							const next = unsignedMod(
								index + (event.key === 'ArrowDown' ? 1 : -1),
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
				<div className={styles.recentActions}>Recent Actions</div>
			)}
			<ul>
				{filtered.map(action => (
					<li
						key={action.id}
						className={classNames(
							styles.action,
							action === selected && styles.selected
						)}
						onPointerMove={() => setSelectedId(action.id)}
						onClick={() => perform(action)}
					>
						{action.icon ? (
							<Icon className={styles.actionIcon} icon={action.icon} />
						) : (
							<span className={styles.actionIcon} />
						)}
						<span className={styles.actionLabel}>{action.label}</span>
						{action.bind?.icon && (
							<BindIcon
								className={styles.actionBindIcon}
								icon={action.bind.icon}
							/>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
