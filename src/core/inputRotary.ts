import {checkIntersection} from 'line-intersect'
import {type vec2} from 'linearly'

import {type Rect} from './geometry'
import {unsignedMod} from './util'

export function signedAngleBetween(target: number, source: number): number {
	return unsignedMod(target - source + 180, 360) - 180
}

export function clampPosWithinRect(
	origin: vec2,
	position: vec2,
	rect: Rect
): vec2 {
	const [[left, top], [right, bottom]] = rect
	for (const [x1, y1, x2, y2] of [
		[left, top, right, top],
		[right, top, right, bottom],
		[right, bottom, left, bottom],
		[left, bottom, left, top],
	] as const) {
		const result = checkIntersection(
			origin[0],
			origin[1],
			position[0],
			position[1],
			x1,
			y1,
			x2,
			y2
		)
		if (result.type === 'intersecting') return [result.point.x, result.point.y]
	}
	return position
}
