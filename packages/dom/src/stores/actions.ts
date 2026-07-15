import type {MenuCommand, MenuItem} from '@tweeq/core'
import * as Bndr from 'bndr-js'
import Case from 'case'
import {createStore, type StoreApi} from 'zustand/vanilla'

interface ActionItemBase {
	id: string
	shortLabel?: string
	menu?: string
	icon?: string
	/**
	 * Sort key among siblings in the same menu / submenu (ascending). Sparse
	 * values are fine (1, 40, 200); unset items keep their registration order
	 * after the explicitly-ordered ones.
	 */
	order?: number
	perform(): any
}

export interface ActionItem extends ActionItemBase {
	label: string
	bind?: Bndr.Emitter
}

export type Action = ActionItem | ActionGroup

export function decorateActionMenuItems(items: readonly MenuItem[]): MenuItem[] {
	return items.map(item => {
		if ('separator' in item) return item
		if ('perform' in item) {
			return {...item, bindIcon: (item as ActionItem).bind?.icon}
		}
		return {...item, children: decorateActionMenuItems(item.children)}
	})
}

export interface ActionGroup {
	icon?: string
	id: string
	label: string
	order?: number
	children: Action[]
}

type BindDescriptor = string | Bndr.Emitter | (string | Bndr.Emitter)[]

export type ActionOptions = ActionItemOptions | ActionGroupOptions

export interface ActionItemOptions extends ActionItemBase {
	label?: string
	bind?: BindDescriptor
}

export interface ActionGroupOptions {
	icon?: string
	id: string
	label?: string
	order?: number
	children: ActionOptions[]
}

export interface ActionsState {
	allActions: Record<string, ActionItem>
	/** Registration-ordered menu tree, order-sorted, with extras appended. */
	menu: MenuItem[]
	/**
	 * Register actions (and their menu placement / hotkey binds). Returns a
	 * disposer that unregisters them and disposes the created emitters — the
	 * framework-neutral replacement for the legacy `onBeforeUnmount` hook.
	 */
	register(options: ActionOptions[]): () => void
	perform(id: string): Promise<void>
	/**
	 * Add a hook invoked before any action runs. Returns a disposer (the
	 * legacy version removed the hook via `onUnmounted`).
	 */
	onBeforePerform(hook: (action: ActionItem) => void): () => void
	setMenuExtras(groupId: string, items: MenuCommand[]): void
}

// Recursively sort each menu / submenu by its items' `order` (ascending, stable
// so equal/unset keys keep registration order — `order` only ranks siblings),
// and append any registered extras (a separator + the extra items) to the group
// whose id matches.
function buildMenu(
	items: Action[],
	extras: Record<string, MenuCommand[]>
): MenuItem[] {
	const sorted = [...items].sort(
		(a, b) =>
			(a.order ?? Number.MAX_SAFE_INTEGER) -
			(b.order ?? Number.MAX_SAFE_INTEGER)
	)
	return sorted.map(item => {
		if (!('children' in item)) return item
		const children = buildMenu(item.children, extras)
		const ex = extras[item.id]
		if (ex?.length) children.push({separator: true}, ...ex)
		return {...item, children}
	})
}

export interface ActionsStore extends StoreApi<ActionsState> {
	dispose(): void
}

/** Create one isolated action registry and its lazily owned input devices. */
export function createActionsStore(): ActionsStore {
	let keyboard: ReturnType<typeof Bndr.keyboard> | undefined
	let gamepad: ReturnType<typeof Bndr.gamepad> | undefined
	const allActions: Record<string, ActionItem> = {}
	const menuRaw: Action[] = []
	let menuExtras: Record<string, MenuCommand[]> = {}
	const onBeforePerformHooks = new Set<(action: ActionItem) => void>()
	const activeEmitters = new Set<Bndr.Emitter>()

	function initBndr() {
		if (typeof window !== 'undefined' && (!keyboard || !gamepad)) {
			keyboard = Bndr.keyboard()
			gamepad = Bndr.gamepad()
		}
	}

	function bindDescriptorToEmitter(
		descriptor: BindDescriptor
	): Bndr.Emitter | undefined {
		if (typeof window === 'undefined') return undefined
		initBndr()
		const binds = Array.isArray(descriptor) ? descriptor : [descriptor]
		const emitters = binds.map(b => {
			if (typeof b === 'string') {
				if (b.startsWith('gamepad:')) {
					const button = b.split(':')[1]
					return gamepad!.button(button as Bndr.ButtonName).down()
				}
				const repeat = b.endsWith('?repeat')
				b = b.replace(/\?.+$/, '')
				return keyboard!.hotkey(b, {
					capture: true,
					preventDefault: true,
					repeat,
				})
			}
			return b
		})
		if (emitters.length === 1) return emitters[0]
		if (emitters.length > 1) return Bndr.combine(...emitters)
	}

	function runBeforePerformHooks(action: ActionItem) {
		for (const hook of onBeforePerformHooks) hook(action)
	}

	const store = createStore<ActionsState>(set => {
	function commit() {
		set({
			allActions: {...allActions},
			menu: buildMenu(menuRaw, menuExtras),
		})
	}

	function register(options: ActionOptions[]): () => void {
		if (typeof window === 'undefined') {
			return () => {}
		}

		const emitters = new Set<Bndr.Emitter>()

		for (const option of options) {
			registerAction(option, menuRaw)
		}

		commit()

		return () => {
			for (const action of options) {
				delete allActions[action.id]
			}
			emitters.forEach(emitter => {
				emitter.dispose()
				activeEmitters.delete(emitter)
			})
			emitters.clear()
			commit()
		}

		function registerAction(option: ActionOptions, parent: Action[]) {
			if ('perform' in option) {
				registerItem(option, parent)
			} else {
				registerGroup(option, parent)
			}
		}

		function registerGroup(option: ActionGroupOptions, parent: Action[]) {
			const label = option.label ? option.label : Case.title(option.id)

			let group: ActionGroup

			const existingAction = parent.find(a => a.id === option.id)

			if (existingAction) {
				if ('perform' in existingAction) {
					throw new Error(`Existing item with id=${option.id} is not a group`)
				}
				group = existingAction

				group.icon ??= option.icon
				group.label ??= label
				// A group can be registered from several places; let any of them
				// supply the order (first non-undefined wins).
				group.order ??= option.order
			} else {
				group = {...option, label, children: []}
				parent.push(group)
			}

			option.children.forEach(child => registerAction(child, group.children))
		}

		function registerItem(option: ActionItemOptions, parent: Action[]) {
			if (option.id in allActions) {
				const existingAction = allActions[option.id]
				existingAction.bind?.dispose()
			}

			const label = option.label ? option.label : Case.title(option.id)
			const bind = option.bind
				? bindDescriptorToEmitter(option.bind)
				: undefined

			const action: ActionItem = {...option, label, bind}

			bind?.on(() => {
				runBeforePerformHooks(action)
				option.perform()
			})

			allActions[option.id] = action

			if (bind) {
				emitters.add(bind)
				activeEmitters.add(bind)
			}

			const index = parent.findIndex(a => a.id === option.id)
			if (index !== -1) {
				parent[index] = action
			} else {
				parent.push(action)
			}
		}
	}

	async function perform(id: string): Promise<void> {
		if (typeof window === 'undefined') {
			return
		}

		const action = allActions[id]
		if (!action) {
			throw new Error(`Action ${id} is not registered`)
		}

		runBeforePerformHooks(action)
		await action.perform()
	}

	function onBeforePerform(hook: (action: ActionItem) => void): () => void {
		onBeforePerformHooks.add(hook)

		return () => {
			onBeforePerformHooks.delete(hook)
		}
	}

	function setMenuExtras(groupId: string, items: MenuCommand[]) {
		// Dynamic, declarative extras appended (after a separator) to a group's
		// children — e.g. a Recent Projects list. Keyed by group id; replacing a
		// group's array is idempotent, so removals are handled cleanly.
		menuExtras = {...menuExtras, [groupId]: items}
		commit()
	}

	return {
		allActions: {},
		menu: [],
		register,
		perform,
		onBeforePerform,
		setMenuExtras,
	}
	})

	return Object.assign(store, {
		dispose() {
			for (const emitter of activeEmitters) emitter.dispose()
			activeEmitters.clear()
			keyboard?.dispose()
			gamepad?.dispose()
			keyboard = undefined
			gamepad = undefined
			onBeforePerformHooks.clear()
			for (const id of Object.keys(allActions)) delete allActions[id]
			menuRaw.length = 0
			menuExtras = {}
			store.setState({allActions: {}, menu: []})
		},
	})
}
