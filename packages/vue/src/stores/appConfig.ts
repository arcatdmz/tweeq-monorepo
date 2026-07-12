import {
	appConfigStore,
	type ConfigEntry,
	type ConfigGroup,
} from '@tweeq/dom'
import {customRef, type Ref} from 'vue'

export type ConfigRef<T> = Ref<T> & {default: T}

function toVueRef<T>(entry: ConfigEntry<T>): ConfigRef<T> {
	const value = customRef<T>((track, trigger) => {
		entry.subscribe(trigger)

		return {
			get() {
				track()
				return entry.value
			},
			set(value) {
				entry.value = value
			},
		}
	}) as ConfigRef<T>

	Object.defineProperty(value, 'default', {
		get: () => entry.default,
		set: defaultValue => {
			entry.default = defaultValue
		},
	})

	return value
}

function toVueGroup(group: ConfigGroup) {
	return {
		ref<T>(name: string, defaultValue: T) {
			return toVueRef(group.ref(name, defaultValue))
		},
		reset: group.reset,
		group(name: string) {
			return toVueGroup(group.group(name))
		},
	}
}

const root = appConfigStore.getState()
const facade = {
	get appId() {
		return appConfigStore.getState().appId
	},
	set appId(appId: string) {
		appConfigStore.getState().setAppId(appId)
	},
	...toVueGroup(root),
}

/** Vue compatibility facade over the shared app-config store. */
export function useAppConfigStore() {
	return facade
}
