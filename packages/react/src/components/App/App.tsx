import {type HTMLAttributes, type ReactNode} from 'react'

import {classNames} from '../../classNames'
import {type TweeqOptions} from '../../initTweeq'
import {TweeqProvider} from '../TweeqProvider'
import {Viewport} from '../Viewport'
import styles from './App.module.styl'

export interface AppProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
		TweeqOptions {
	appId?: string
	title?: ReactNode
	withProvider?: boolean
	embedded?: boolean
}

export function App({
	appId = 'app',
	title,
	withProvider = true,
	embedded = false,
	children,
	className,
	colorMode,
	accentColor,
	backgroundColor,
	grayColor,
	colorPresets,
	...props
}: AppProps) {
	const content = (
		<Viewport
			{...props}
			className={classNames(styles.app, embedded && styles.embedded, className)}
			appId={appId}
			data-tq-part="root"
		>
			{title}
			<main className={styles.main}>{children}</main>
		</Viewport>
	)
	if (!withProvider) return content
	return (
		<TweeqProvider
			appId={appId}
			colorMode={colorMode}
			accentColor={accentColor}
			backgroundColor={backgroundColor}
			grayColor={grayColor}
			colorPresets={colorPresets}
		>
			{content}
		</TweeqProvider>
	)
}
