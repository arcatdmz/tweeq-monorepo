import {
	type Action,
	type ActionGroup,
	type ActionGroupOptions,
	type ActionItem,
	type ActionItemOptions,
	type ActionOptions,
	type ActionsState,
} from '@tweeq/dom'
import {onBeforeUnmount, onUnmounted, reactive} from 'vue'

import {useTweeqRuntime} from '../runtime'

export type {
	Action,
	ActionGroup,
	ActionGroupOptions,
	ActionItem,
	ActionItemOptions,
	ActionOptions,
}

export interface ActionsFacade
	extends Omit<ActionsState, 'register' | 'onBeforePerform'> {
	register(options: ActionOptions[]): void
	onBeforePerform(hook: (action: ActionItem) => void): void
}

const facades = new WeakMap<object, ActionsFacade>()

/** Vue lifecycle and reactivity facade over the shared actions store. */
export function useActionsStore() {
	const {actionsStore} = useTweeqRuntime()
	let facade = facades.get(actionsStore)
	if (!facade) {
		const created = reactive({
			...actionsStore.getState(),
			register(options: ActionOptions[]) {
				const dispose = actionsStore.getState().register(options)
				onBeforeUnmount(dispose)
			},
			onBeforePerform(hook: (action: ActionItem) => void) {
				const dispose = actionsStore.getState().onBeforePerform(hook)
				onUnmounted(dispose)
			},
		}) as ActionsFacade
		actionsStore.subscribe(state => {
			Object.assign(created, state, {
				register: created.register,
				onBeforePerform: created.onBeforePerform,
			})
		})
		facades.set(actionsStore, created)
		facade = created
	}
	return facade
}
