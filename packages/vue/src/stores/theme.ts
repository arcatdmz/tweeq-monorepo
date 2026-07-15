import type {ThemeState} from '@tweeq/dom'
import {reactive, type UnwrapNestedRefs} from 'vue'

import {useTweeqRuntime} from '../runtime'

const facades = new WeakMap<object, UnwrapNestedRefs<ThemeState>>()

/** Vue compatibility facade over the shared theme store. */
export function useThemeStore() {
	const {themeStore} = useTweeqRuntime()
	let facade = facades.get(themeStore)
	if (!facade) {
		facade = reactive(themeStore.getState())
		themeStore.subscribe(state => Object.assign(facade!, state))
		facades.set(themeStore, facade)
	}
	return facade
}
