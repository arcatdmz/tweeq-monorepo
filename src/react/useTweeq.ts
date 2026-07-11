import {useStore} from 'zustand'

import {actionsStore, appConfigStore, modalStore, themeStore} from '../core'

/** Subscribe to Tweeq's four public stores as React state. */
export function useTweeq() {
	const theme = useStore(themeStore)
	const actions = useStore(actionsStore)
	const config = useStore(appConfigStore)
	const modal = useStore(modalStore)

	return {theme, actions, config, modal}
}
