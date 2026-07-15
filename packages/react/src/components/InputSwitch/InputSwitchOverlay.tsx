import {useEffect, useState} from 'react'

import {Icon} from '../Icon'

export interface InputSwitchOverlayProps {
	value: boolean | null
}

export function InputSwitchOverlay({value}: InputSwitchOverlayProps) {
	const [mounted, setMounted] = useState(value !== null)
	const [lastValue, setLastValue] = useState(value ?? false)
	const [leaving, setLeaving] = useState(false)

	useEffect(() => {
		if (value !== null) {
			setMounted(true)
			setLastValue(value)
			setLeaving(false)
			return
		}
		if (!mounted) return

		setLeaving(true)
		const timeout = window.setTimeout(() => {
			setMounted(false)
			setLeaving(false)
		}, 200)
		return () => window.clearTimeout(timeout)
	}, [mounted, value])

	if (!mounted) return null
	const displayedValue = value ?? lastValue

	return (
		<div
			className={leaving ? 'tq-input-switch-overlay-hidden' : undefined}
			data-tq-component="input-switch-overlay"
			data-tq-part="switch-overlay"
			onTransitionEnd={event => {
				if (leaving && event.target === event.currentTarget) {
					setMounted(false)
					setLeaving(false)
				}
			}}
		>
			<Icon
				icon="ic:baseline-radio-button-unchecked"
				data-tq-part="switch-state-icon"
				data-tq-value="off"
				data-tq-active={!displayedValue ? '' : undefined}
			/>
			<Icon
				icon="ic:baseline-check-circle"
				data-tq-part="switch-state-icon"
				data-tq-value="on"
				data-tq-active={displayedValue ? '' : undefined}
			/>
		</div>
	)
}
