import {mat2d, scalar, vec2} from 'linearly'

export type ZuiVisibleRect = readonly [vec2, vec2]

export function getZuiVisibleRect(
	transform: mat2d,
	size: vec2
): ZuiVisibleRect {
	const inverse = mat2d.inv(transform) ?? mat2d.I
	return [
		vec2.transformMat2d([0, 0], inverse),
		vec2.transformMat2d(size, inverse),
	]
}

export function getZuiDotState(transform: mat2d, spacing = 20) {
	const [a, , , d, tx, ty] = transform
	return {
		opacity: scalar.smoothstep(0.1, 0.4, (a + d) / 2),
		position: [tx, ty] as vec2,
		size: [spacing * a, spacing * d] as vec2,
	}
}
