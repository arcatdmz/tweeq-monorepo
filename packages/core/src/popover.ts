import {type vec2} from 'linearly'

import {type BalloonArrowSide} from './balloon'

export type PopoverPlacement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end'

export interface PopoverOffsetOptions {
	mainAxis?: number
	crossAxis?: number
}

export type PopoverOffset = number | PopoverOffsetOptions

export interface RectLike {
	top: number
	right: number
	bottom: number
	left: number
	width: number
	height: number
}

export interface PopoverGeometry {
	shiftX: number
	shiftY: number
	arrowSide?: BalloonArrowSide
	arrowOffset: number
}

export function getPopoverPositionStyles(
	placement: PopoverPlacement | vec2,
	offset: PopoverOffset,
	anchorName: string
): Record<string, string> {
	if (typeof placement !== 'string') {
		return {left: `${placement[0]}px`, top: `${placement[1]}px`}
	}

	const [side, align] = placement.split('-')
	const normalized =
		typeof offset === 'number'
			? {mainAxis: offset, crossAxis: 0}
			: {mainAxis: offset.mainAxis ?? 0, crossAxis: offset.crossAxis ?? 0}
	const main = `${normalized.mainAxis}px`
	const cross = `${normalized.crossAxis}px`
	const horizontal = side === 'top' || side === 'bottom'
	const style: Record<string, string> = {
		positionAnchor: anchorName,
		positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
	}

	if (side === 'top') {
		style.bottom = 'anchor(top)'
		style.marginBottom = main
	} else if (side === 'bottom') {
		style.top = 'anchor(bottom)'
		style.marginTop = main
	} else if (side === 'left') {
		style.right = 'anchor(left)'
		style.marginRight = main
	} else {
		style.left = 'anchor(right)'
		style.marginLeft = main
	}

	if (align === 'start') {
		if (horizontal) {
			style.left = 'anchor(left)'
			style.marginLeft = cross
		} else {
			style.top = 'anchor(top)'
			style.marginTop = cross
		}
	} else if (align === 'end') {
		if (horizontal) {
			style.right = 'anchor(right)'
			style.marginRight = cross
		} else {
			style.bottom = 'anchor(bottom)'
			style.marginBottom = cross
		}
	} else if (horizontal) {
		style.left = 'anchor(center)'
		style.translate = '-50% 0'
	} else {
		style.top = 'anchor(center)'
		style.translate = '0 -50%'
	}

	return style
}

export function getPopoverGeometry({
	reference,
	popover,
	placement,
	currentShiftX,
	currentShiftY,
	viewportWidth,
	viewportHeight,
	arrow,
	viewportMargin = 8,
}: {
	reference: RectLike
	popover: RectLike
	placement: PopoverPlacement
	currentShiftX: number
	currentShiftY: number
	viewportWidth: number
	viewportHeight: number
	arrow: boolean
	viewportMargin?: number
}): PopoverGeometry {
	const [requestedSide] = placement.split('-')
	let shiftX = 0
	let shiftY = 0
	const left = popover.left - currentShiftX
	const right = popover.right - currentShiftX
	const top = popover.top - currentShiftY
	const bottom = popover.bottom - currentShiftY
	if (right > viewportWidth - viewportMargin) {
		shiftX = viewportWidth - viewportMargin - right
	}
	if (left + shiftX < viewportMargin) shiftX = viewportMargin - left
	if (bottom > viewportHeight - viewportMargin) {
		shiftY = viewportHeight - viewportMargin - bottom
	}
	if (top + shiftY < viewportMargin) shiftY = viewportMargin - top

	if (!arrow) return {shiftX, shiftY, arrowOffset: 0}

	const finalLeft = popover.left - currentShiftX + shiftX
	const finalTop = popover.top - currentShiftY + shiftY
	const finalRect = {
		left: finalLeft,
		top: finalTop,
		right: finalLeft + popover.width,
		bottom: finalTop + popover.height,
	}
	let arrowSide: BalloonArrowSide
	if (finalRect.top >= reference.bottom - 1) arrowSide = 'top'
	else if (finalRect.bottom <= reference.top + 1) arrowSide = 'bottom'
	else if (finalRect.left >= reference.right - 1) arrowSide = 'left'
	else {
		arrowSide =
			requestedSide === 'bottom'
				? 'top'
				: requestedSide === 'top'
					? 'bottom'
					: requestedSide === 'right'
						? 'left'
						: 'right'
	}

	const arrowOffset =
		arrowSide === 'top' || arrowSide === 'bottom'
			? reference.left + reference.width / 2 - finalRect.left
			: reference.top + reference.height / 2 - finalRect.top

	return {shiftX, shiftY, arrowSide, arrowOffset}
}
