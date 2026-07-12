import {createStore} from 'zustand/vanilla'

import {
	applyThemeToDOM,
	type ColorMode,
	computeTheme,
	type MonacoThemeData,
	type Theme,
	type ThemeSettings,
} from '../theme'
import {appConfigStore} from './appConfig'

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

export const themeStore = createStore<ThemeState>(() => ({
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
		if (options.colorMode) {
			colorMode.default = options.colorMode
		}
		if (options.accentColor) {
			accentColor.default = options.accentColor
		}
		if (options.backgroundColor) {
			backgroundColor.default = options.backgroundColor
		}
		if (options.grayColor) {
			grayColor.default = options.grayColor
		}
	},
}))

function refresh() {
	themeStore.setState(computeState())
}

accentColor.subscribe(refresh)
grayColor.subscribe(refresh)
backgroundColor.subscribe(refresh)

// Snap the background to the appearance's default when the user toggles
// light/dark, but leave it untouched afterwards (and on load) so a custom
// background sticks. Skipped for appId re-key reloads (the port's analogue of
// "not immediate": restoring a saved colorMode must not clobber a saved
// custom background).
colorMode.subscribe((mode, {reload}) => {
	if (!reload) {
		backgroundColor.value = mode === 'light' ? '#ffffff' : '#111111'
	}
	refresh()
})

// Promote the theme to CSS variables automatically (the legacy store's
// `watch(theme, …, {immediate: true})`).
if (typeof document !== 'undefined') {
	const apply = () => {
		const {theme, colorMode} = themeStore.getState()
		applyThemeToDOM(theme, colorMode)
	}

	const start = () => {
		apply()
		themeStore.subscribe((state, prevState) => {
			if (
				state.theme !== prevState.theme ||
				state.colorMode !== prevState.colorMode
			) {
				apply()
			}
		})
	}

	if (document.body) {
		start()
	} else {
		document.addEventListener('DOMContentLoaded', start, {once: true})
	}
}
