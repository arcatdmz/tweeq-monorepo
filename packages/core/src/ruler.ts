import {scalar, type vec2} from 'linearly'

export interface RulerScale {
	value: number
	label?: string
	opacity?: number
}

export function getRulerDefaultScales(range: vec2): RulerScale[] {
	const start = Math.ceil(range[0])
	const end = Math.floor(range[1])
	return Array.from({length: Math.max(0, end - start + 1)}, (_, index) => ({
		value: start + index,
	}))
}

export function getRulerPixelsPerUnit(width: number, range: vec2): number {
	const duration = range[1] - range[0]
	return duration === 0 ? 0 : width / duration
}

export function getRulerScaleOffset(
	value: number,
	range: vec2,
	pixelsPerUnit: number
): number {
	return (value - range[0]) * pixelsPerUnit
}

export function getRulerValueAtPixel(
	x: number,
	width: number,
	range: vec2
): number {
	return width === 0 ? range[0] : scalar.fit(x, 0, width, ...range)
}
