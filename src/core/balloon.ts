export type BalloonArrowSide = 'top' | 'bottom' | 'left' | 'right'

export interface BalloonGeometryOptions {
	arrowSide?: BalloonArrowSide | null
	arrowOffset?: number
	radius?: number
}

export interface BalloonGeometry {
	path: string
	layerWidth: number
	layerHeight: number
	transformOrigin: string
	wrapperPadding: {
		paddingTop?: string
		paddingRight?: string
		paddingBottom?: string
		paddingLeft?: string
	}
}

export const BALLOON_ARROW_WIDTH = 14
export const BALLOON_ARROW_HEIGHT = 7
export const BALLOON_ARROW_GAP = 2

/** Generate the measured speech-balloon outline used by Balloon. */
export function getBalloonGeometry(
	width: number,
	height: number,
	{arrowSide = null, arrowOffset = 0, radius = 13}: BalloonGeometryOptions = {}
): BalloonGeometry {
	const arrowDepth = (side: BalloonArrowSide) =>
		arrowSide === side ? BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP : 0
	const layerWidth = width + arrowDepth('left') + arrowDepth('right')
	const layerHeight = height + arrowDepth('top') + arrowDepth('bottom')
	const offset = `${arrowOffset}px`
	const transformOrigin = (() => {
		switch (arrowSide) {
			case 'top':
				return `${offset} ${BALLOON_ARROW_GAP}px`
			case 'bottom':
				return `${offset} calc(100% - ${BALLOON_ARROW_GAP}px)`
			case 'left':
				return `${BALLOON_ARROW_GAP}px ${offset}`
			case 'right':
				return `calc(100% - ${BALLOON_ARROW_GAP}px) ${offset}`
			default:
				return '50% 50%'
		}
	})()
	const wrapperPadding = {
		paddingTop:
			arrowSide === 'top'
				? `${BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP}px`
				: undefined,
		paddingRight:
			arrowSide === 'right'
				? `${BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP}px`
				: undefined,
		paddingBottom:
			arrowSide === 'bottom'
				? `${BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP}px`
				: undefined,
		paddingLeft:
			arrowSide === 'left'
				? `${BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP}px`
				: undefined,
	}

	if (width === 0 || height === 0) {
		return {
			path: '',
			layerWidth,
			layerHeight,
			transformOrigin,
			wrapperPadding,
		}
	}

	const r = Math.min(radius, width / 2, height / 2)
	const halfArrow = BALLOON_ARROW_WIDTH / 2
	const ox = arrowSide === 'left' ? BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP : 0
	const oy = arrowSide === 'top' ? BALLOON_ARROW_HEIGHT + BALLOON_ARROW_GAP : 0
	const clampX = (x: number) =>
		Math.max(ox + r + halfArrow, Math.min(ox + width - r - halfArrow, x))
	const clampY = (y: number) =>
		Math.max(oy + r + halfArrow, Math.min(oy + height - r - halfArrow, y))
	const parts = [`M ${ox + r},${oy}`]

	if (arrowSide === 'top') {
		const center = clampX(ox + arrowOffset)
		parts.push(
			`H ${center - halfArrow}`,
			`L ${center},${oy - BALLOON_ARROW_HEIGHT}`,
			`L ${center + halfArrow},${oy}`
		)
	}
	parts.push(`H ${ox + width - r}`, `A ${r} ${r} 0 0 1 ${ox + width},${oy + r}`)

	if (arrowSide === 'right') {
		const center = clampY(oy + arrowOffset)
		parts.push(
			`V ${center - halfArrow}`,
			`L ${ox + width + BALLOON_ARROW_HEIGHT},${center}`,
			`L ${ox + width},${center + halfArrow}`
		)
	}
	parts.push(
		`V ${oy + height - r}`,
		`A ${r} ${r} 0 0 1 ${ox + width - r},${oy + height}`
	)

	if (arrowSide === 'bottom') {
		const center = clampX(ox + arrowOffset)
		parts.push(
			`H ${center + halfArrow}`,
			`L ${center},${oy + height + BALLOON_ARROW_HEIGHT}`,
			`L ${center - halfArrow},${oy + height}`
		)
	}
	parts.push(`H ${ox + r}`, `A ${r} ${r} 0 0 1 ${ox},${oy + height - r}`)

	if (arrowSide === 'left') {
		const center = clampY(oy + arrowOffset)
		parts.push(
			`V ${center + halfArrow}`,
			`L ${ox - BALLOON_ARROW_HEIGHT},${center}`,
			`L ${ox},${center - halfArrow}`
		)
	}
	parts.push(`V ${oy + r}`, `A ${r} ${r} 0 0 1 ${ox + r},${oy}`, 'Z')

	return {
		path: parts.join(' '),
		layerWidth,
		layerHeight,
		transformOrigin,
		wrapperPadding,
	}
}
