import type {Scheme} from '../InputComplex'
import type {ShowOptions} from '../PaneModalComplex/types'
import type {
	ModalTab,
	PromptTabsFn,
	TabsShowOptions,
} from '../PaneModalTabs/types'
import {useTweeqRuntime} from '../runtime'

export type PromptFn = <T extends Record<string, unknown>>(
	defaultValue: T,
	scheme: Scheme<T>,
	options?: ShowOptions
) => Promise<T | null>

const facades = new WeakMap<object, ReturnType<typeof createFacade>>()

function createFacade(modalStore: ReturnType<typeof useTweeqRuntime>['modalStore']) {
	const state = modalStore.getState()
	return {
		prompt: state.prompt as PromptFn,
		promptTabs: state.promptTabs as (
			tabs: ModalTab[],
			options?: TabsShowOptions
		) => Promise<void>,
		registerPrompt(fn: PromptFn | null) {
			state.registerPrompt(fn as Parameters<typeof state.registerPrompt>[0])
		},
		registerPromptTabs(fn: PromptTabsFn | null) {
			state.registerPromptTabs(
				fn as Parameters<typeof state.registerPromptTabs>[0]
			)
		},
	}
}

/** Vue compatibility facade over the shared modal store. */
export function useModalStore() {
	const {modalStore} = useTweeqRuntime()
	let facade = facades.get(modalStore)
	if (!facade) {
		facade = createFacade(modalStore)
		facades.set(modalStore, facade)
	}
	return facade
}
