import {createStore, type StoreApi} from 'zustand/vanilla'

/**
 * Port of the legacy pinia `appConfig` store: app-scoped, localStorage-backed
 * config values.
 *
 * Persistence semantics (kept from the legacy implementation):
 * - A value is stored under `"${appId}.${path}.${name}"` as JSON.
 * - Writing a value strictly equal (`===`) to the current default removes the
 *   stored key instead of persisting it.
 * - Changing an entry's default: if nothing is stored, the value snaps to the
 *   new default; if the stored JSON value equals the new default, the key is
 *   removed (the value keeps following the default from then on).
 * - `reset()` removes every localStorage key whose name starts with the
 *   group's path prefix; in-memory values are left untouched (legacy did the
 *   same).
 *
 * Entries resolve their storage key dynamically from the current appId and
 * reload their value whenever `setAppId` changes it.
 */

export interface ConfigEntry<T> {
	/** Current value. Assigning persists per the semantics above. */
	value: T
	/** The default value. Assigning mirrors legacy `config.default = …`. */
	default: T
	/** Full localStorage key under the current appId. */
	readonly key: string
	/** Notifies whenever `value` changes (from a write, a default change, or an appId re-key). */
	subscribe(listener: ConfigEntryListener<T>): () => void
}

export type ConfigEntryListener<T> = (
	value: T,
	event: {
		/**
		 * True when the change comes from an appId re-key reload rather than an
		 * actual write — lets derived stores skip write-triggered side effects
		 * (e.g. the theme store snapping the background on colorMode changes).
		 */
		reload: boolean
	}
) => void

export interface ConfigGroup {
	ref<T>(name: string, defaultValue: T): ConfigEntry<T>
	group(name: string): ConfigGroup
	/** Remove every persisted key under this group's path. */
	reset(): void
}

export interface AppConfigState {
	appId: string
	/** Bumped whenever any entry's value or default changes (coarse reactivity). */
	revision: number
	setAppId(appId: string): void
	ref<T>(name: string, defaultValue: T): ConfigEntry<T>
	group(name: string): ConfigGroup
	reset(): void
}

interface EntryImpl {
	/** Key relative to the appId, e.g. `"theme.accentColor"`. */
	relKey: string
	value: unknown
	defaultValue: unknown
	listeners: Set<ConfigEntryListener<any>>
}

export interface AppConfigStoreOptions {
	appId?: string
	/** Override persistence for tests, non-window realms, or custom hosts. */
	storage?: Storage | null
}

export type AppConfigStore = StoreApi<AppConfigState>

/** Create an isolated application-config store. No state is created at import. */
export function createAppConfigStore(
	options: AppConfigStoreOptions = {}
): AppConfigStore {
	// Entries are shared by callers of this store instance, never across apps.
	const entries = new Map<string, EntryImpl>()
	const getStorage = () =>
		options.storage !== undefined
			? options.storage
			: typeof localStorage === 'undefined'
				? null
				: localStorage

	return createStore<AppConfigState>((set, get) => {
	function fullKey(relKey: string) {
		return `${get().appId}.${relKey}`
	}

	function bump() {
		set(state => ({revision: state.revision + 1}))
	}

	function notify(entry: EntryImpl, event: {reload: boolean}) {
		for (const listener of entry.listeners) listener(entry.value, event)
	}

	function setValue(entry: EntryImpl, value: unknown) {
		if (Object.is(entry.value, value)) return

		entry.value = value

		const storage = getStorage()
		if (storage) {
			if (value === entry.defaultValue) {
				storage.removeItem(fullKey(entry.relKey))
			} else {
				storage.setItem(fullKey(entry.relKey), JSON.stringify(value))
			}
		}

		bump()
		notify(entry, {reload: false})
	}

	function setDefault(entry: EntryImpl, defaultValue: unknown) {
		if (Object.is(entry.defaultValue, defaultValue)) return

		entry.defaultValue = defaultValue

		const storage = getStorage()
		const stored = JSON.parse(storage?.getItem(fullKey(entry.relKey)) ?? 'null')

		if (stored === null) {
			setValue(entry, defaultValue)
		} else if (stored === defaultValue) {
			storage?.removeItem(fullKey(entry.relKey))
		}

		bump()
	}

	function createEntry(relKey: string, defaultValue: unknown): EntryImpl {
		const entry: EntryImpl = {
			relKey,
			value: defaultValue,
			defaultValue,
			listeners: new Set(),
		}

		const stored = getStorage()?.getItem(fullKey(relKey)) ?? null
		if (stored !== null) {
			entry.value = JSON.parse(stored)
		}

		entries.set(relKey, entry)

		return entry
	}

	function wrapEntry<T>(entry: EntryImpl): ConfigEntry<T> {
		return {
			get value() {
				return entry.value as T
			},
			set value(value: T) {
				setValue(entry, value)
			},
			get default() {
				return entry.defaultValue as T
			},
			set default(defaultValue: T) {
				setDefault(entry, defaultValue)
			},
			get key() {
				return fullKey(entry.relKey)
			},
			subscribe(listener: ConfigEntryListener<T>) {
				entry.listeners.add(listener)
				return () => {
					entry.listeners.delete(listener)
				}
			},
		}
	}

	function createGroup(path: string): ConfigGroup {
		return {
			ref<T>(name: string, defaultValue: T): ConfigEntry<T> {
				const relKey = path === '' ? name : `${path}.${name}`
				const entry = entries.get(relKey) ?? createEntry(relKey, defaultValue)
				return wrapEntry<T>(entry)
			},
			group(name: string) {
				return createGroup(path === '' ? name : `${path}.${name}`)
			},
			reset() {
				const storage = getStorage()
				if (!storage) return

				const prefix = path === '' ? get().appId : `${get().appId}.${path}`

				for (let i = storage.length - 1; i >= 0; i--) {
					const key = storage.key(i)
					if (key?.startsWith(prefix)) {
						storage.removeItem(key)
					}
				}
			},
		}
	}

	function setAppId(appId: string) {
		if (get().appId === appId) return

		set({appId})

		// Re-key every registered entry: reload its value from localStorage
		// under the new namespace (or fall back to its default). Two passes so
		// listeners observe a fully consistent snapshot.
		const storage = getStorage()
		const changed: EntryImpl[] = []

		for (const entry of entries.values()) {
			const stored = storage?.getItem(`${appId}.${entry.relKey}`) ?? null
			const value = stored !== null ? JSON.parse(stored) : entry.defaultValue

			if (!Object.is(entry.value, value)) {
				entry.value = value
				changed.push(entry)
			}
		}

		for (const entry of changed) {
			notify(entry, {reload: true})
		}

		bump()
	}

	const rootGroup = createGroup('')

	return {
		appId: options.appId ?? 'tweeq',
		revision: 0,
		setAppId,
		...rootGroup,
	}
	})
}
