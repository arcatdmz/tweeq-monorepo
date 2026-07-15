export type CubicBezierValue = readonly [number, number, number, number]

export function getCubicBezierPath(value: CubicBezierValue): string {
	const [x1, y1, x2, y2] = value
	return `M 0,0 C ${x1},${y1} ${x2},${y2} 1,1`
}

export function updateCubicBezierPoint(
	value: CubicBezierValue,
	point: 0 | 1,
	x: number,
	y: number
): CubicBezierValue {
	const clamp = (n: number) => Math.max(0, Math.min(1, n))
	const next: [number, number, number, number] = [...value]
	next[point * 2] = clamp(x)
	next[point * 2 + 1] = clamp(y)
	return next
}
