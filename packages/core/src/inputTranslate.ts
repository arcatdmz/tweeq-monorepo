import {type vec2} from 'linearly'

export function decomposeVec2(value?: number | vec2): vec2 | undefined {
	if (value === undefined) return undefined
	return typeof value === 'number' ? [value, value] : value
}

export function getTranslateOverlayGeometry({
	value,
	min,
	max,
	scale,
	center = [150, 150],
}: {
	value: vec2
	min?: vec2
	max?: vec2
	scale: number
	center?: vec2
}) {
	const offset: vec2 = [
		center[0] - value[0] * scale,
		center[1] - value[1] * scale,
	]
	const start: vec2 = [
		center[0] - (value[0] - (min?.[0] ?? -9999)) * scale,
		center[1] - (value[1] - (min?.[1] ?? -9999)) * scale,
	]
	const end: vec2 = [
		center[0] - (value[0] - (max?.[0] ?? 9999)) * scale,
		center[1] - (value[1] - (max?.[1] ?? 9999)) * scale,
	]

	return {
		grid: {
			backgroundSize: `${10 * scale}px ${10 * scale}px`,
			backgroundPosition: `${offset[0] - 1}px ${offset[1] - 1}px`,
		},
		zero: {
			left: `${start[0]}px`,
			top: `${start[1]}px`,
			width: `${end[0] - start[0]}px`,
			height: `${end[1] - start[1]}px`,
		},
	}
}
