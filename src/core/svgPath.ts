import {vec2} from 'linearly'

const point = (value: vec2) => `${value[0]} ${value[1]}`

export function svgLine(from: vec2, to: vec2): string {
	return `M ${point(from)} L ${point(to)}`
}

export function svgCircle(center: vec2, radius: number): string {
	return `M ${center[0] + radius} ${center[1]} A ${radius} ${radius} 0 1 0 ${center[0] - radius} ${center[1]} A ${radius} ${radius} 0 1 0 ${center[0] + radius} ${center[1]}`
}

export function svgArc(
	center: vec2,
	radius: number,
	startDegrees: number,
	endDegrees: number
): string {
	const delta = endDegrees - startDegrees
	if (Math.abs(delta) >= 359.999) return svgCircle(center, radius)
	const start = vec2.dir(startDegrees, radius, center)
	const end = vec2.dir(endDegrees, radius, center)
	return `M ${point(start)} A ${radius} ${radius} 0 ${Math.abs(delta) > 180 ? 1 : 0} ${delta >= 0 ? 1 : 0} ${point(end)}`
}

export function mergeSvgPaths(paths: readonly string[]): string {
	return paths.filter(Boolean).join(' ')
}
