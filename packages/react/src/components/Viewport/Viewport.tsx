import './Viewport.global.styl'

import {type HTMLAttributes, useRef} from 'react'

import {classNames} from '../../classNames'
import {initTweeq} from '../../initTweeq'

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
	const initialized = useRef(false)
	if (!initialized.current) {
		initTweeq(appId)
		initialized.current = true
	}

	return (
		<div
			{...props}
			className={classNames('TqViewport', className)}
			data-tq-component="viewport"
			data-tq-part="viewport"
		>
			{children}
		</div>
	)
}
