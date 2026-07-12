import {useCallback, useSyncExternalStore} from 'react'

import {type ConfigEntry} from '../../core'

export type ConfigSetter<T> = (value: T | ((current: T) => T)) => void

/** React state backed directly by a persistent core `ConfigEntry`. */
export function useConfigRef<T>(entry: ConfigEntry<T>): [T, ConfigSetter<T>] {
	const value = useSyncExternalStore(
		callback =>
			entry.subscribe((_value, {reload: _reload}) => {
				void _reload
				callback()
			}),
		() => entry.value,
		() => entry.value
	)

	const setValue = useCallback<ConfigSetter<T>>(
		next => {
			entry.value =
				typeof next === 'function'
					? (next as (current: T) => T)(entry.value)
					: next
		},
		[entry]
	)

	return [value, setValue]
}
