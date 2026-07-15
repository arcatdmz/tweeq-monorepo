import {scalar, type vec2} from 'linearly'

import {getNumberPresition, precisionOf} from './util.js'

export const NUMBER_PX_PER_STEP = 20

export interface NumberPrecisionOptions {
	step?: number
	display: string
	width: number
	min: number
	max: number
	tweaking: boolean
	speed: number
	precision: number
}

export function getInputNumberPrecision({
	step,
	display,
	width,
	min,
	max,
	tweaking,
	speed,
	precision,
}: NumberPrecisionOptions): number {
	if (step) return precisionOf(step)
	const displayPrecision = getNumberPresition(display)
	const sliderPrecision =
		min !== Number.MIN_SAFE_INTEGER &&
		max !== Number.MAX_SAFE_INTEGER &&
		width > 0
			? precisionOf(Math.abs(max - min) / width)
			: 0
	if (tweaking) {
		return Math.max(displayPrecision, sliderPrecision, precisionOf(speed))
	}
	return Math.min(precision, Math.max(displayPrecision, sliderPrecision))
}

export interface NumberScrubState {
	local: number
	directionAverage: vec2
	offsetWeight: number
	gestureSpeed: number
}

export function updateNumberScrub({
	state,
	delta,
	barVisible,
	min,
	max,
	width,
	step,
	speed,
	minSpeed,
	maxSpeed,
}: {
	state: NumberScrubState
	delta: vec2
	barVisible: boolean
	min: number
	max: number
	width: number
	step?: number
	speed: number
	minSpeed: number
	maxSpeed: number
}): NumberScrubState & {deltaValue: number} {
	const [dx, dy] = delta
	const directionAverage = normalizeOrUnitX([
		scalar.lerp(state.directionAverage[0], Math.abs(dx), 0.1),
		scalar.lerp(state.directionAverage[1], Math.abs(dy), 0.1),
	])
	const offsetWeight = scalar.smoothstep(
		0.4,
		0.6,
		Math.abs(directionAverage[0])
	)
	const baseSpeed = barVisible
		? (max - min) / width
		: step
			? step / NUMBER_PX_PER_STEP
			: 1
	const deltaValue = dx * baseSpeed * speed * offsetWeight
	let local = state.local + deltaValue
	if (!barVisible) local = scalar.clamp(local, min, max)
	const gestureSpeed = scalar.clamp(
		scalar.lerp(
			state.gestureSpeed * 0.98 ** dy,
			state.gestureSpeed,
			offsetWeight
		),
		minSpeed,
		maxSpeed
	)

	return {
		local,
		directionAverage,
		offsetWeight,
		gestureSpeed,
		deltaValue,
	}
}

function normalizeOrUnitX(value: vec2): vec2 {
	const length = Math.hypot(value[0], value[1])
	return length === 0 ? [1, 0] : [value[0] / length, value[1] / length]
}

export type NumberExpression = (value: number, context: {i: number}) => number

export function compileNumberExpression(expression: string): NumberExpression {
	return new Function(
		'x',
		'context',
		`const {i} = context;
		const result = (${expression});
		if (typeof result === 'number') return result;
		throw new Error('Value is not a number');`
	) as NumberExpression
}
