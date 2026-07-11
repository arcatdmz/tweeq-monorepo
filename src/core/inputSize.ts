import {scalar, type vec2} from 'linearly'

export function updateSizeWithRatio({
	previous,
	next,
	valueOnEdit,
	keepRatio,
}: {
	previous: vec2
	next: vec2
	valueOnEdit: vec2
	keepRatio: boolean
}): {value: vec2; keepRatio: boolean} {
	const bothChanged = previous[0] !== next[0] && previous[1] !== next[1]
	if (bothChanged) {
		const previousRatio = previous[0] / previous[1]
		const nextRatio = next[0] / next[1]
		if (!scalar.approx(previousRatio, nextRatio)) keepRatio = false
	}
	const index = previous[0] !== next[0] ? 0 : 1
	if (!keepRatio) return {value: next, keepRatio}
	let scale = next[index] / valueOnEdit[index]
	if (!Number.isFinite(scale)) scale = 1
	return {
		value: valueOnEdit.map((value, i) =>
			i === index ? next[index] : value * scale
		) as unknown as vec2,
		keepRatio,
	}
}
