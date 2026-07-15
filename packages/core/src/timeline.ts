import {type vec2} from 'linearly'

export function getTimelineScrollBounds(
	frameRange: vec2,
	duration: number,
	overscroll: number
): vec2 {
	const margin = overscroll * duration
	return [frameRange[0] - margin, frameRange[1] - duration + margin]
}

export function clampTimelineRange(
	range: vec2,
	frameRange: vec2,
	overscroll: number
): vec2 {
	const duration = range[1] - range[0]
	const [minStart, maxStart] = getTimelineScrollBounds(
		frameRange,
		duration,
		overscroll
	)
	const start =
		minStart <= maxStart
			? Math.max(minStart, Math.min(maxStart, range[0]))
			: range[0]
	return [start, start + duration]
}

export function showTimelineRange(current: vec2, shown: vec2 | number): vec2 {
	const [min, max] = typeof shown === 'number' ? [shown, shown + 1] : shown
	const duration = current[1] - current[0]
	if (min < current[0] && current[1] < max) return [min, max]
	if (min < current[0]) return [min, min + duration]
	if (current[1] < max) return [max - duration, max]
	return current
}

export function panTimelineRange(
	range: vec2,
	deltaPixels: number,
	frameWidth: number,
	frameRange: vec2,
	overscroll: number
): vec2 {
	const delta = deltaPixels / frameWidth
	return clampTimelineRange(
		[range[0] + delta, range[1] + delta],
		frameRange,
		overscroll
	)
}

export function zoomTimelineRange(
	range: vec2,
	origin: number,
	appliedZoom: number,
	frameRange: vec2,
	overscroll: number
): vec2 {
	return clampTimelineRange(
		[
			origin - (origin - range[0]) / appliedZoom,
			origin + (range[1] - origin) / appliedZoom,
		],
		frameRange,
		overscroll
	)
}

export function centerTimelineFrame(range: vec2, frame: number): vec2 {
	const duration = range[1] - range[0]
	return [frame - duration / 2, frame + duration / 2]
}
