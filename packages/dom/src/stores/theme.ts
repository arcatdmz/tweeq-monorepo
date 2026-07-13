import {
	type ColorMode,
	computeTheme,
	type MonacoThemeData,
	type Theme,
	type ThemeSettings,
} from '@tweeq/core'
import {createStore, type StoreApi} from 'zustand/vanilla'

import {applyThemeToDOM} from '../applyThemeToDOM.js'
import type {AppConfigStore} from './appConfig.js'

export interface ThemeDefaults {
	colorMode?: ColorMode
	accentColor?: string
	backgroundColor?: string
	grayColor?: string
}

/**
 * Like the legacy pinia store, the state exposes both the four persisted
 * settings and every derived theme token at the top level (plus the whole
 * `theme` object, which the DOM applier and provider consume as one value).
 */
export interface ThemeState extends ThemeSettings, Theme {
	theme: Theme
	monacoTheme: MonacoThemeData

	setAccentColor(color: string): void
	setColorMode(colorMode: ColorMode): void
	setGrayColor(color: string): void
	setBackgroundColor(color: string): void
	/** Change the defaults without clobbering values the user has persisted. */
	setDefault(options: ThemeDefaults): void
}

export interface ThemeStore extends StoreApi<ThemeState> {
	dispose(): void
}

/** Create an isolated theme store derived from one app-config instance. */
export function createThemeStore(appConfigStore: AppConfigStore): ThemeStore {
	const config = appConfigStore.getState().group('theme')
	const accentColor = config.ref('accentColor', '#0000ff')
	const colorMode = config.ref<ColorMode>('colorMode', 'light')
	const grayColor = config.ref('grayColor', '#8B8D98')
	const backgroundColor = config.ref(
		'backgroundColor',
		colorMode.value === 'light' ? '#ffffff' : '#111111'
	)

	function computeState(): ThemeSettings &
		Theme & {theme: Theme; monacoTheme: MonacoThemeData} {
		const settings: ThemeSettings = {
			colorMode: colorMode.value,
			accentColor: accentColor.value,
			grayColor: grayColor.value,
			backgroundColor: backgroundColor.value,
		}
		const {theme, monacoTheme} = computeTheme(settings)
		return {...settings, ...theme, theme, monacoTheme}
	}

	const store = createStore<ThemeState>(() => ({
		...computeState(),
		setAccentColor(color: string) {
			accentColor.value = color
		},
		setColorMode(mode: ColorMode) {
			colorMode.value = mode
		},
		setGrayColor(color: string) {
			grayColor.value = color
		},
		setBackgroundColor(color: string) {
			backgroundColor.value = color
		},
		setDefault(options: ThemeDefaults) {
			if (options.colorMode) colorMode.default = options.colorMode
			if (options.accentColor) accentColor.default = options.accentColor
			if (options.backgroundColor) {
				backgroundColor.default = options.backgroundColor
			}
			if (options.grayColor) grayColor.default = options.grayColor
		},
	}))

	const refresh = () => store.setState(computeState())
	const disposers = [
		accentColor.subscribe(refresh),
		grayColor.subscribe(refresh),
		backgroundColor.subscribe(refresh),
		colorMode.subscribe((mode, {reload}) => {
			if (!reload) {
				backgroundColor.value = mode === 'light' ? '#ffffff' : '#111111'
			}
			refresh()
		}),
	]

	return Object.assign(store, {
		dispose() {
			for (const dispose of disposers) dispose()
		},
	})
}

/**
 * Explicitly bind a theme store to a DOM root and return its disposer.
 * Calling this function, rather than importing the module, owns the browser
 * write/listener lifecycle.
 */
export function bindThemeStoreToDOM(
	themeStore: ThemeStore,
	rootElement?: HTMLElement
): () => void {
	const doc = rootElement?.ownerDocument ??
		(typeof document === 'undefined' ? undefined : document)
	if (!doc) return () => {}

	let unsubscribe: (() => void) | undefined
	let disposed = false
	const apply = () => {
		const root = rootElement ?? doc.body
		if (!root) return
		const {theme, colorMode} = themeStore.getState()
		applyThemeToDOM(theme, colorMode, root)
	}
	const start = () => {
		if (disposed || unsubscribe) return
		apply()
		unsubscribe = themeStore.subscribe((state, prevState) => {
			if (
				state.theme !== prevState.theme ||
				state.colorMode !== prevState.colorMode
			) {
				apply()
			}
		})
	}
	if (rootElement || doc.body) {
		start()
	} else {
		doc.addEventListener('DOMContentLoaded', start, {once: true})
	}

	return () => {
		disposed = true
		doc.removeEventListener('DOMContentLoaded', start)
		unsubscribe?.()
	}
}
