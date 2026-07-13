import {
	createTweeqRuntime,
	type TweeqRuntime,
} from './runtime.js'
import type {ConfigEntry} from './stores/appConfig.js'

let defaultRuntime: TweeqRuntime | undefined

/**
 * Compatibility runtime for provider-less legacy consumers. Merely importing
 * the package does not create it; new applications should create/inject their
 * own runtime through a renderer provider.
 */
export function getDefaultTweeqRuntime(): TweeqRuntime {
	defaultRuntime ??= createTweeqRuntime()
	return defaultRuntime
}

export function configureDefaultTweeqRuntime(
	appId: string,
	options: Parameters<TweeqRuntime['configure']>[1] = {}
): TweeqRuntime {
	const runtime = getDefaultTweeqRuntime()
	runtime.configure(appId, options)
	return runtime
}

type StoreKey =
	| 'actionsStore'
	| 'appConfigStore'
	| 'modalStore'
	| 'multiSelectStore'
	| 'themeStore'

function lazyStore<K extends StoreKey>(key: K): TweeqRuntime[K] {
	return new Proxy({} as TweeqRuntime[K], {
		get(_target, property) {
			const store = getDefaultTweeqRuntime()[key]
			const value = Reflect.get(store, property, store)
			return typeof value === 'function' ? value.bind(store) : value
		},
		set(_target, property, value) {
			return Reflect.set(getDefaultTweeqRuntime()[key], property, value)
		},
	})
}

function lazyConfigEntry<T>(
	getEntry: (runtime: TweeqRuntime) => ConfigEntry<T>
): ConfigEntry<T> {
	return new Proxy({} as ConfigEntry<T>, {
		get(_target, property) {
			const entry = getEntry(getDefaultTweeqRuntime())
			const value = Reflect.get(entry, property, entry)
			return typeof value === 'function' ? value.bind(entry) : value
		},
		set(_target, property, value) {
			return Reflect.set(
				getEntry(getDefaultTweeqRuntime()),
				property,
				value
			)
		},
	})
}

/** @deprecated Inject a `TweeqRuntime` through the renderer provider. */
export const actionsStore = lazyStore('actionsStore')
/** @deprecated Inject a `TweeqRuntime` through the renderer provider. */
export const appConfigStore = lazyStore('appConfigStore')
/** @deprecated Inject a `TweeqRuntime` through the renderer provider. */
export const modalStore = lazyStore('modalStore')
/** @deprecated Inject a `TweeqRuntime` through the renderer provider. */
export const multiSelectStore = lazyStore('multiSelectStore')
/** @deprecated Inject a `TweeqRuntime` through the renderer provider. */
export const themeStore = lazyStore('themeStore')
/** @deprecated Read this entry from `TweeqRuntime.inputTimeFormatEntry`. */
export const inputTimeFormatEntry = lazyConfigEntry(
	runtime => runtime.inputTimeFormatEntry
)
