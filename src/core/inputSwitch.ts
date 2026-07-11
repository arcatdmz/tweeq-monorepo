export type SwitchTweakValue = boolean | 'toggle' | null

export function getSwitchTweakValue({
	dragging,
	initialX,
	currentX,
	valueOnTweak,
	threshold = 3,
}: {
	dragging: boolean
	initialX: number
	currentX: number
	valueOnTweak: boolean
	threshold?: number
}): boolean | null {
	if (!dragging) return null
	const delta = currentX - initialX
	return Math.abs(delta) <= threshold ? !valueOnTweak : delta > 0
}

/** Return the boolean consumed by a switch shortcut, or undefined. */
export function getSwitchKeyValue(
	key: string,
	current: boolean
): boolean | undefined {
	switch (key.toLowerCase()) {
		case ' ':
			return !current
		case 't':
		case '1':
		case 'y':
		case 'p':
			return true
		case 'f':
		case '0':
		case 'n':
		case 'm':
			return false
		default:
			return undefined
	}
}
