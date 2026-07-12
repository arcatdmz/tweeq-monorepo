import './PaneModal.global.styl'

import {type HTMLAttributes, useEffect, useRef, useState} from 'react'

import {classNames} from '../../classNames'
import {useEventListener} from '../../hooks'
import styles from './PaneModal.module.styl'

export interface PaneModalProps extends HTMLAttributes<HTMLDivElement> {
	open: boolean
}

export function PaneModal({open, className, ...props}: PaneModalProps) {
	const root = useRef<HTMLDivElement>(null)
	const [emphasize, setEmphasize] = useState(false)
	useEffect(() => {
		const element = root.current
		if (!element) return
		try {
			if (open && !element.matches(':popover-open')) element.showPopover()
			else if (!open && element.matches(':popover-open')) element.hidePopover()
		} catch {
			// Unsupported native popover renders in place.
		}
	}, [open])
	useEventListener<PointerEvent>(
		typeof window === 'undefined' ? null : window,
		'pointerdown',
		event => {
			if (!open || event.composedPath().includes(root.current as EventTarget))
				return
			setEmphasize(false)
			requestAnimationFrame(() => setEmphasize(true))
		}
	)

	return (
		<div
			{...props}
			ref={root}
			className={classNames(
				'TqPaneModal',
				styles.modal,
				emphasize && styles.emphasize,
				className
			)}
			popover="manual"
			onAnimationEnd={() => setEmphasize(false)}
		/>
	)
}
