import {type vec2} from 'linearly'

export type Rect = readonly [topLeft: vec2, bottomRight: vec2]

export function rectFromDOMRect(rect: DOMRectReadOnly): Rect {
	return [
		[rect.left, rect.top],
		[rect.right, rect.bottom],
	]
}

export function rectCenter(rect: Rect): vec2 {
	return [
		(rect[0][0] + rect[1][0]) / 2,
		(rect[0][1] + rect[1][1]) / 2,
	]
}

export function uniteRects(a: Rect, b: Rect): Rect {
	return [
		[Math.min(a[0][0], b[0][0]), Math.min(a[0][1], b[0][1])],
		[Math.max(a[1][0], b[1][0]), Math.max(a[1][1], b[1][1])],
	]
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
	return !(
		a[1][0] < b[0][0] ||
		a[0][0] > b[1][0] ||
		a[1][1] < b[0][1] ||
		a[0][1] > b[1][1]
	)
}
