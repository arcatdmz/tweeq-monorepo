import {
	type Action,
	type ActionGroup,
	type ActionGroupOptions,
	type ActionItem,
	type ActionItemOptions,
	type ActionOptions,
	actionsStore,
} from '@tweeq/dom'
import {onBeforeUnmount, onUnmounted, reactive} from 'vue'

export type {
	Action,
	ActionGroup,
	ActionGroupOptions,
	ActionItem,
	ActionItemOptions,
	ActionOptions,
}

const state = actionsStore.getState()
const facade = reactive({
	...state,
	register(options: ActionOptions[]) {
		const dispose = actionsStore.getState().register(options)
		onBeforeUnmount(dispose)
	},
	onBeforePerform(hook: (action: ActionItem) => void) {
		const dispose = actionsStore.getState().onBeforePerform(hook)
		onUnmounted(dispose)
	},
})

actionsStore.subscribe(state => {
	Object.assign(facade, state, {
		register: facade.register,
		onBeforePerform: facade.onBeforePerform,
	})
})

/** Vue lifecycle and reactivity facade over the shared actions store. */
export function useActionsStore() {
	return facade
}
