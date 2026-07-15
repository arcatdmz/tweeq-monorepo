import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import {
	TweeqRuntimeProvider,
	useOptionalTweeqRuntime,
	useOwnedTweeqRuntime,
} from '../../runtime'

export interface ViewportProps extends HTMLAttributes<HTMLDivElement> {
	/** App config namespace used by the standalone viewport. */
	appId?: string
}

export function Viewport({
	appId = 'viewport',
	className,
	children,
	...props
}: ViewportProps) {
	const parentRuntime = useOptionalTweeqRuntime()
	const ownedRuntime = useOwnedTweeqRuntime(appId, {}, parentRuntime)
	const content = (
		<div
			{...props}
			className={classNames('TqViewport', className)}
			data-tq-component="viewport"
			data-tq-part="viewport"
		>
			{children}
		</div>
	)
	if (parentRuntime) return content
	return (
		<TweeqRuntimeProvider runtime={ownedRuntime} bind disposeOnUnmount>
			{content}
		</TweeqRuntimeProvider>
	)
}
