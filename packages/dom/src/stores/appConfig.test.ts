import {beforeEach, describe, expect, it, vi} from 'vitest'

/**
 * The appConfig store keeps module-level entry state, so every test gets a
 * fresh module instance (vi.resetModules + dynamic import) and a fresh
 * in-memory localStorage stub.
 */

function createMemoryStorage(): Storage {
	const map = new Map<string, string>()

	return {
		get length() {
			return map.size
		},
		key(index: number) {
			return [...map.keys()][index] ?? null
		},
		getItem(key: string) {
			return map.get(key) ?? null
		},
		setItem(key: string, value: string) {
			map.set(key, value)
		},
		removeItem(key: string) {
			map.delete(key)
		},
		clear() {
			map.clear()
		},
	}
}

let storage: Storage

async function loadStore() {
	const {appConfigStore} = await import('./appConfig')
	return appConfigStore.getState()
}

beforeEach(() => {
	vi.resetModules()
	storage = createMemoryStorage()
	vi.stubGlobal('localStorage', storage)
})

describe('appConfig persistence', () => {
	it('does not persist a value equal to its default', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 42)

		expect(entry.value).toBe(42)
		expect(storage.getItem('tweeq.foo')).toBeNull()

		entry.value = 42
		expect(storage.getItem('tweeq.foo')).toBeNull()
	})

	it('persists non-default values as JSON under "appId.name"', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 42)

		entry.value = 43
		expect(storage.getItem('tweeq.foo')).toBe('43')
	})

	it('removes the stored key when the value returns to the default', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 42)

		entry.value = 43
		entry.value = 42
		expect(storage.getItem('tweeq.foo')).toBeNull()
	})

	it('restores a stored value on creation', async () => {
		storage.setItem('tweeq.foo', JSON.stringify('stored'))

		const config = await loadStore()
		const entry = config.ref('foo', 'default')

		expect(entry.value).toBe('stored')
	})

	it('namespaces nested groups with dots', async () => {
		const config = await loadStore()
		const entry = config.group('theme').ref('accentColor', '#0000ff')

		expect(entry.key).toBe('tweeq.theme.accentColor')

		entry.value = '#ff0000'
		expect(storage.getItem('tweeq.theme.accentColor')).toBe('"#ff0000"')
	})

	it('notifies subscribers on value changes only', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 1)

		const listener = vi.fn()
		entry.subscribe(listener)

		entry.value = 1 // unchanged → no notification
		entry.value = 2

		expect(listener).toHaveBeenCalledTimes(1)
		expect(listener).toHaveBeenCalledWith(2, {reload: false})
	})
})

describe('appConfig defaults', () => {
	it('follows a default change when nothing is stored', async () => {
		const config = await loadStore()
		const entry = config.ref('mode', 'light')

		entry.default = 'dark'

		expect(entry.value).toBe('dark')
		expect(storage.getItem('tweeq.mode')).toBeNull()
	})

	it('un-persists a stored value equal to the new default', async () => {
		storage.setItem('tweeq.mode', JSON.stringify('dark'))

		const config = await loadStore()
		const entry = config.ref('mode', 'light')
		expect(entry.value).toBe('dark')

		entry.default = 'dark'

		expect(entry.value).toBe('dark')
		expect(storage.getItem('tweeq.mode')).toBeNull()
	})

	it('keeps a stored value that differs from the new default', async () => {
		storage.setItem('tweeq.mode', JSON.stringify('custom'))

		const config = await loadStore()
		const entry = config.ref('mode', 'light')

		entry.default = 'dark'

		expect(entry.value).toBe('custom')
		expect(storage.getItem('tweeq.mode')).toBe('"custom"')
	})
})

describe('appConfig reset', () => {
	it('removes every stored key under the group path', async () => {
		storage.setItem('other-app.foo', '1')

		const config = await loadStore()
		const theme = config.group('theme')

		config.ref('foo', 0).value = 1
		theme.ref('accent', 'a').value = 'b'

		theme.reset()
		expect(storage.getItem('tweeq.theme.accent')).toBeNull()
		expect(storage.getItem('tweeq.foo')).toBe('1')

		config.reset()
		expect(storage.getItem('tweeq.foo')).toBeNull()
		expect(storage.getItem('other-app.foo')).toBe('1')
	})
})

describe('setAppId', () => {
	it('re-keys entries: reloads stored values from the new namespace', async () => {
		storage.setItem('my-app.foo', JSON.stringify(99))

		const {appConfigStore} = await import('./appConfig')
		const config = appConfigStore.getState()
		const entry = config.ref('foo', 0)
		expect(entry.value).toBe(0)

		const listener = vi.fn()
		entry.subscribe(listener)

		config.setAppId('my-app')

		expect(appConfigStore.getState().appId).toBe('my-app')
		expect(entry.value).toBe(99)
		expect(entry.key).toBe('my-app.foo')
		expect(listener).toHaveBeenCalledWith(99, {reload: true})
	})

	it('falls back to the default when the new namespace has nothing stored', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 'default')

		entry.value = 'changed'
		config.setAppId('my-app')

		expect(entry.value).toBe('default')
	})

	it('persists subsequent writes under the new appId', async () => {
		const config = await loadStore()
		const entry = config.ref('foo', 0)

		config.setAppId('my-app')
		entry.value = 7

		expect(storage.getItem('my-app.foo')).toBe('7')
		expect(storage.getItem('tweeq.foo')).toBeNull()
	})
})
