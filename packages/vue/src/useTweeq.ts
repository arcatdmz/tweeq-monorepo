import type {ColorMode} from '@tweeq/core'

import * as components from './components'
import {useInputColor} from './InputColor/useInputColor'
import {useActionsStore} from './stores/actions'
import {useAppConfigStore} from './stores/appConfig'
import {useModalStore} from './stores/modal'
import {useThemeStore} from './stores/theme'

export interface TweeqOptions {
	colorMode?: ColorMode
	accentColor?: string
	backgroundColor?: string
	grayColor?: string
	/** App-wide InputColor swatches. Defaults to the theme palette. */
	colorPresets?: string[]
}

let didWarnAboutComponentFacade = false

export function initTweeq(appId: string, options: TweeqOptions = {}) {
	const appConfig = useAppConfigStore()
	appConfig.appId = appId

	const theme = useThemeStore()
	theme.setDefault(options)

	useInputColor(options.colorPresets)
}

export function useTweeq() {
	if (!didWarnAboutComponentFacade && typeof console !== 'undefined') {
		didWarnAboutComponentFacade = true
		// eslint-disable-next-line no-console -- this is the compatibility contract
		console.warn(
			'[Tweeq] Accessing components through useTweeq() is deprecated and will be removed in @tweeq/vue 2.0.0. Import components directly from @tweeq/vue instead.',
		)
	}
	const theme = useThemeStore()
	const actions = useActionsStore()
	const config = useAppConfigStore()
	const modal = useModalStore()

	return {theme, actions, config, modal, ...components}
}
