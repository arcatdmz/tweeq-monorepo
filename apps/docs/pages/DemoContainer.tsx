import {InputButton, Viewport} from '@tweeq/react'
import {type ReactNode, useState} from 'react'

export interface DemoContainerProps {
	className?: string
	fullscreenEnabled?: boolean
	children: (props: {isFullscreen: boolean}) => ReactNode
}

/**
 * Port of docs/.vuepress/DemoContainer.vue: a tweeq Viewport island inside
 * the VuePress page, with a subtle Full Screen toggle at the top-right.
 * Like the original, ONLY this subtree gets tweeq's base styles.
 */
export function DemoContainer({
	className,
	fullscreenEnabled = true,
	children,
}: DemoContainerProps) {
	const [isFullscreen, setIsFullscreen] = useState(false)

	return (
		<Viewport
			appId="react-demo"
			className={
				'DemoContainer' +
				(isFullscreen ? ' fullscreen' : '') +
				(className ? ` ${className}` : '')
			}
		>
			{fullscreenEnabled && (
				<InputButton
					className="full-screen-button"
					icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}
					label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
					subtle
					onClick={() => setIsFullscreen(fullscreen => !fullscreen)}
				/>
			)}
			{children({isFullscreen})}
		</Viewport>
	)
}
