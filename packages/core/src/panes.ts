export type PaneDimension = number | 'minimized'

export type FloatingPanePosition =
	| {anchor: 'maximized'}
	| {anchor: 'top'; height: PaneDimension}
	| {anchor: 'left-top'; width: PaneDimension; height: PaneDimension}
	| {anchor: 'left'; width: PaneDimension}
	| {anchor: 'left-bottom'; width: PaneDimension; height: PaneDimension}
	| {anchor: 'bottom'; height: PaneDimension}
	| {anchor: 'right-bottom'; width: PaneDimension; height: PaneDimension}
	| {anchor: 'right'; width: PaneDimension}
	| {anchor: 'right-top'; width: PaneDimension; height: PaneDimension}

export function clampSplitSize({
	value,
	fixed,
	viewportSize,
	minPixelSize = 40,
}: {
	value: number
	fixed: boolean
	viewportSize: number
	minPixelSize?: number
}): number {
	if (!fixed) return Math.max(10, Math.min(90, value))
	return Math.max(
		minPixelSize,
		Math.min(Math.max(minPixelSize, viewportSize - minPixelSize), value)
	)
}

export function resizeSplitPane({
	start,
	movement,
	fixed,
	viewportSize,
	minPixelSize = 40,
}: {
	start: number
	movement: number
	fixed?: 'first' | 'second'
	viewportSize: number
	minPixelSize?: number
}): number {
	const raw = fixed
		? start + (fixed === 'first' ? movement : -movement)
		: start + (viewportSize > 0 ? (movement / viewportSize) * 100 : 0)
	return clampSplitSize({
		value: raw,
		fixed: Boolean(fixed),
		viewportSize,
		minPixelSize,
	})
}

export type SplitPaneKeyboardKey =
	| 'ArrowDown'
	| 'ArrowLeft'
	| 'ArrowRight'
	| 'ArrowUp'
	| 'End'
	| 'Home'

export function resizeSplitPaneFromKeyboard({
	current,
	key,
	direction,
	fixed,
	viewportSize,
	minPixelSize = 40,
	largeStep = false,
}: {
	current: number
	key: string
	direction: 'horizontal' | 'vertical'
	fixed?: 'first' | 'second'
	viewportSize: number
	minPixelSize?: number
	largeStep?: boolean
}): number | undefined {
	const nearKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
	const farKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
	if (key !== nearKey && key !== farKey && key !== 'Home' && key !== 'End') {
		return undefined
	}

	const step = fixed
		? largeStep
			? 50
			: 10
		: viewportSize * (largeStep ? 0.1 : 0.01)
	const movement =
		key === 'Home'
			? Number.NEGATIVE_INFINITY
			: key === 'End'
				? Number.POSITIVE_INFINITY
				: key === nearKey
					? -step
					: step

	return resizeSplitPane({
		start: current,
		movement,
		fixed,
		viewportSize,
		minPixelSize,
	})
}

export function getSplitPaneSeparatorValues({
	size,
	fixed,
	viewportSize,
	minPixelSize = 40,
}: {
	size: number
	fixed?: 'first' | 'second'
	viewportSize: number
	minPixelSize?: number
}): {min: number; max: number; now: number; text: string} {
	if (!fixed) {
		const now = clampSplitSize({value: size, fixed: false, viewportSize})
		return {min: 10, max: 90, now, text: `${now}%`}
	}

	const min = minPixelSize
	const max = Math.max(min, viewportSize - minPixelSize)
	const position = fixed === 'first' ? size : viewportSize - size
	const now = Math.max(min, Math.min(max, position))
	return {min, max, now, text: `${now}px`}
}

export function resizeFloatingPane({
	position,
	axis,
	edge,
	current,
	viewport,
	minimizeThreshold = 90,
	resizeWidth = 12,
}: {
	position: FloatingPanePosition
	axis: 'width' | 'height'
	edge: 'near' | 'far'
	current: number
	viewport: number
	minimizeThreshold?: number
	resizeWidth?: number
}): FloatingPanePosition {
	if (current <= minimizeThreshold && axis in position) {
		return {...position, [axis]: 'minimized'} as FloatingPanePosition
	}
	if (current < viewport - resizeWidth && axis in position) {
		return {...position, [axis]: current} as FloatingPanePosition
	}

	if (axis === 'width') {
		if (current >= viewport - resizeWidth) {
			if (position.anchor === 'left' || position.anchor === 'right') {
				return {anchor: 'maximized'}
			}
			if (position.anchor.endsWith('top') && 'height' in position) {
				return {anchor: 'top', height: position.height}
			}
			if (position.anchor.endsWith('bottom') && 'height' in position) {
				return {anchor: 'bottom', height: position.height}
			}
		}
		const opposite = edge === 'near' ? 'right' : 'left'
		if (position.anchor === 'maximized')
			return {anchor: opposite, width: current}
		if (
			(position.anchor === 'top' || position.anchor === 'bottom') &&
			'height' in position
		) {
			return {
				anchor: `${opposite}-${position.anchor}`,
				width: current,
				height: position.height,
			} as FloatingPanePosition
		}
	} else {
		if (current >= viewport - resizeWidth) {
			if (position.anchor === 'top' || position.anchor === 'bottom') {
				return {anchor: 'maximized'}
			}
			if (position.anchor.startsWith('right') && 'width' in position) {
				return {anchor: 'right', width: position.width}
			}
			if (position.anchor.startsWith('left') && 'width' in position) {
				return {anchor: 'left', width: position.width}
			}
		}
		const opposite = edge === 'near' ? 'bottom' : 'top'
		if (position.anchor === 'maximized')
			return {anchor: opposite, height: current}
		if (
			(position.anchor === 'right' || position.anchor === 'left') &&
			'width' in position
		) {
			return {
				anchor: `${position.anchor}-${opposite}`,
				width: position.width,
				height: current,
			} as FloatingPanePosition
		}
	}
	return position
}
