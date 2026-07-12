import {appConfigStore, type ThemeDefaults, themeStore} from '@tweeq/dom'

export interface TweeqOptions extends ThemeDefaults {
	colorPresets?: readonly string[]
}

/** Initialize the framework-neutral stores for one app namespace. */
export function initTweeq(appId: string, options: TweeqOptions = {}): void {
	appConfigStore.getState().setAppId(appId)
	themeStore.getState().setDefault({
		colorMode: options.colorMode,
		accentColor: options.accentColor,
		backgroundColor: options.backgroundColor,
		grayColor: options.grayColor,
	})
}
