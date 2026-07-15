import {useStore} from 'zustand'

import {useTweeqRuntime} from './runtime'

/** Subscribe to Tweeq's four public stores as React state. */
export function useTweeq() {
	const runtime = useTweeqRuntime()
	const theme = useStore(runtime.themeStore)
	const actions = useStore(runtime.actionsStore)
	const config = useStore(runtime.appConfigStore)
	const modal = useStore(runtime.modalStore)

	return {theme, actions, config, modal}
}
