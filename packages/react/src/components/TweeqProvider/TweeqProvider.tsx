import {Fragment, type PropsWithChildren, useEffect} from 'react'

import {type TweeqOptions} from '../../initTweeq'
import {TweeqRuntimeProvider, useOwnedTweeqRuntime} from '../../runtime'
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
	const runtime = useOwnedTweeqRuntime(appId, {
		colorMode,
		accentColor,
		backgroundColor,
		grayColor,
	})
	useEffect(() => {
		runtime.configure(appId, {
			colorMode,
			accentColor,
			backgroundColor,
			grayColor,
		})
	}, [accentColor, appId, backgroundColor, colorMode, grayColor, runtime])

	return (
		<TweeqRuntimeProvider runtime={runtime} bind disposeOnUnmount>
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
		</TweeqRuntimeProvider>
	)
}
