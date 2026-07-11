import '../../../common.styl'

import {type PropsWithChildren, useRef} from 'react'

import {initTweeq, type TweeqOptions} from '../../initTweeq'

export interface TweeqProviderProps extends PropsWithChildren, TweeqOptions {
	appId: string
}

export function TweeqProvider({
	appId,
	colorMode,
	accentColor,
	backgroundColor,
	grayColor,
	children,
}: TweeqProviderProps) {
	const initialized = useRef(false)
	if (!initialized.current) {
		initTweeq(appId, {
			colorMode,
			accentColor,
			backgroundColor,
			grayColor,
		})
		initialized.current = true
	}

	// Future batches mount CommandPalette, MultiSelectPopup, PaneModalComplex,
	// PaneModalTabs, and TooltipRoot beside `children` at this seam.
	return children
}
