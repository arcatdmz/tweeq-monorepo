import {useCallback, useEffect, useRef, useState} from 'react'

export interface FlashControls {
	flashing: boolean
	flash(): void
}

/** A re-armable one-shot flag for attention-flash CSS animations. */
export function useFlash(duration = 1200): FlashControls {
	const [flashing, setFlashing] = useState(false)
	const frame = useRef<number | undefined>(undefined)
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const flash = useCallback(() => {
		setFlashing(false)
		if (frame.current !== undefined) cancelAnimationFrame(frame.current)
		clearTimeout(timer.current)

		frame.current = requestAnimationFrame(() => {
			setFlashing(true)
			timer.current = setTimeout(() => setFlashing(false), duration)
		})
	}, [duration])

	useEffect(() => {
		return () => {
			if (frame.current !== undefined) cancelAnimationFrame(frame.current)
			clearTimeout(timer.current)
		}
	}, [])

	return {flashing, flash}
}
