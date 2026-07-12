import {modalStore} from '@tweeq/dom'

import type {Scheme} from '../InputComplex'
import type {ShowOptions} from '../PaneModalComplex/types'
import type {
	ModalTab,
	PromptTabsFn,
	TabsShowOptions,
} from '../PaneModalTabs/types'

export type PromptFn = <T extends Record<string, unknown>>(
	defaultValue: T,
	scheme: Scheme<T>,
	options?: ShowOptions
) => Promise<T | null>

const state = modalStore.getState()
const facade = {
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

/** Vue compatibility facade over the shared modal store. */
export function useModalStore() {
	return facade
}
