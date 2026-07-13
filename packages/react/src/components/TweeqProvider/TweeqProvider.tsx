import {Fragment, type PropsWithChildren, useRef} from 'react'

import {initTweeq, type TweeqOptions} from '../../initTweeq'
import {CommandPalette} from '../CommandPalette'
import {InputColorProvider} from '../InputColor/InputColorContext'
import {MultiSelectPopup} from '../MultiSelectPopup'
import {PaneModalComplex} from '../PaneModalComplex'
import {PaneModalTabs} from '../PaneModalTabs'
import {TooltipRoot} from '../Tooltip'

export interface TweeqProviderProps extends PropsWithChildren, TweeqOptions {
	appId: string
}

export function TweeqProvider({
	appId,
	colorMode,
	accentColor,
	backgroundColor,
	grayColor,
	colorPresets,
	children,
}: TweeqProviderProps) {
	const initialized = useRef(false)
	if (!initialized.current) {
		initTweeq(appId, {
			colorMode,
			accentColor,
			backgroundColor,
			grayColor,
			colorPresets,
		})
		initialized.current = true
	}

	return (
		<InputColorProvider presets={colorPresets}>
			<Fragment>
				{children}
				<CommandPalette />
				<MultiSelectPopup />
				<PaneModalComplex />
				<PaneModalTabs />
				<TooltipRoot />
			</Fragment>
		</InputColorProvider>
	)
}
