import {createInputTimeFormatEntry} from './inputTimeConfig.js'
import {
	type ActionsStore,
	createActionsStore,
} from './stores/actions.js'
import {
	type AppConfigStore,
	createAppConfigStore,
} from './stores/appConfig.js'
import {createModalStore, type ModalStore} from './stores/modal.js'
import {
	createMultiSelectStore,
	type MultiSelectStore,
} from './stores/multiSelect.js'
import {
	bindThemeStoreToDOM,
	createThemeStore,
	type ThemeDefaults,
	type ThemeStore,
} from './stores/theme.js'

export interface TweeqRuntimeOptions extends ThemeDefaults {
	appId?: string
	storage?: Storage | null
}

export interface TweeqRuntime {
	readonly actionsStore: ActionsStore
	readonly appConfigStore: AppConfigStore
	readonly modalStore: ModalStore
	readonly multiSelectStore: MultiSelectStore
	readonly themeStore: ThemeStore
	readonly inputTimeFormatEntry: ReturnType<
		typeof createInputTimeFormatEntry
	>
	configure(appId: string, options?: ThemeDefaults): void
	/** Bind theme writes to a DOM root; the caller owns the returned disposer. */
	bind(rootElement?: HTMLElement): () => void
	dispose(): void
}

/**
 * Create every mutable DOM concern for one Tweeq application or viewport.
 * Construction is SSR-safe; browser writes/listeners start only through
 * `bind()` or an interaction that explicitly registers a controller.
 */
export function createTweeqRuntime(
	options: TweeqRuntimeOptions = {}
): TweeqRuntime {
	const appConfigStore = createAppConfigStore({
		appId: options.appId,
		storage: options.storage,
	})
	const actionsStore = createActionsStore()
	const modalStore = createModalStore()
	const multiSelectStore = createMultiSelectStore()
	const themeStore = createThemeStore(appConfigStore)
	const inputTimeFormatEntry = createInputTimeFormatEntry(appConfigStore)
	const bindings = new Set<() => void>()
	let disposed = false

	function configure(appId: string, defaults: ThemeDefaults = {}) {
		if (disposed) throw new Error('Cannot configure a disposed Tweeq runtime')
		appConfigStore.getState().setAppId(appId)
		themeStore.getState().setDefault(defaults)
	}

	if (
		options.colorMode ||
		options.accentColor ||
		options.backgroundColor ||
		options.grayColor
	) {
		themeStore.getState().setDefault(options)
	}

	return {
		actionsStore,
		appConfigStore,
		modalStore,
		multiSelectStore,
		themeStore,
		inputTimeFormatEntry,
		configure,
		bind(rootElement) {
			if (disposed) throw new Error('Cannot bind a disposed Tweeq runtime')
			const unbind = bindThemeStoreToDOM(themeStore, rootElement)
			let active = true
			const disposeBinding = () => {
				if (!active) return
				active = false
				bindings.delete(disposeBinding)
				unbind()
			}
			bindings.add(disposeBinding)
			return disposeBinding
		},
		dispose() {
			if (disposed) return
			disposed = true
			for (const disposeBinding of [...bindings]) disposeBinding()
			actionsStore.dispose()
			modalStore.dispose()
			multiSelectStore.dispose()
			themeStore.dispose()
		},
	}
}
