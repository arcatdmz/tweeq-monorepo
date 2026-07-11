import {type HTMLAttributes, useEffect, useRef} from 'react'

import {classNames} from '../../classNames'
import styles from './TweakOverlay.module.styl'

export type TweakOverlayProps = HTMLAttributes<HTMLDivElement>

/**
 * A manual popover whose children live in the browser top layer, escaping
 * transformed/backdrop-filtered containing blocks.
 */
export function TweakOverlay({
	children,
	className,
	...props
}: TweakOverlayProps) {
	const root = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = root.current
		try {
			element?.showPopover()
		} catch {
			// Unsupported or already shown: it still renders in place.
		}

		return () => {
			try {
				element?.hidePopover()
			} catch {
				// Already hidden or detached.
			}
		}
	}, [])

	return (
		<div
			{...props}
			ref={root}
			className={classNames(styles.tqTweakOverlay, className)}
			popover="manual"
		>
			{children}
		</div>
	)
}
