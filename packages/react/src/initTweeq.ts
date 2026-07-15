import {
	configureDefaultTweeqRuntime,
	type ThemeDefaults,
	type TweeqRuntime,
} from '@tweeq/dom'

export interface TweeqOptions extends ThemeDefaults {
	colorPresets?: readonly string[]
}

/** Initialize the framework-neutral stores for one app namespace. */
let unbindDefaultRuntime: (() => void) | undefined

export function initTweeq(
	appId: string,
	options: TweeqOptions = {}
): TweeqRuntime {
	const runtime = configureDefaultTweeqRuntime(appId, {
		colorMode: options.colorMode,
		accentColor: options.accentColor,
		backgroundColor: options.backgroundColor,
		grayColor: options.grayColor,
	})
	if (!unbindDefaultRuntime && typeof document !== 'undefined') {
		unbindDefaultRuntime = runtime.bind()
	}
	return runtime
}
