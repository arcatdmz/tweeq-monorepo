import {themeStore} from '@tweeq/dom'
import {reactive} from 'vue'

const facade = reactive(themeStore.getState())

themeStore.subscribe(state => {
	Object.assign(facade, state)
})

/** Vue compatibility facade over the shared theme store. */
export function useThemeStore() {
	return facade
}
