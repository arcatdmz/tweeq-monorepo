import {appConfigStore, type ThemeDefaults, themeStore} from '../core'

export type TweeqOptions = ThemeDefaults

/** Initialize the framework-neutral stores for one app namespace. */
export function initTweeq(appId: string, options: TweeqOptions = {}): void {
	appConfigStore.getState().setAppId(appId)
	themeStore.getState().setDefault(options)
}
