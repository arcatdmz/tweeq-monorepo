import '../../../common.styl'

import {Fragment, type PropsWithChildren, useRef} from 'react'

import {initTweeq, type TweeqOptions} from '../../initTweeq'
import {CommandPalette} from '../CommandPalette'
import {InputColorProvider} from '../InputColor/InputColorContext'
import {MultiSelectPopup} from '../MultiSelectPopup'
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

	// Future batches mount PaneModalComplex and PaneModalTabs beside `children`.
	return (
		<InputColorProvider presets={colorPresets}>
			<Fragment>
				{children}
				<CommandPalette />
				<MultiSelectPopup />
				<TooltipRoot />
			</Fragment>
		</InputColorProvider>
	)
}
