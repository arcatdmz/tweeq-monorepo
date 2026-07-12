import {random} from 'lodash-es'

function distinct<T>(previous: T, roll: () => T, tries = 10): T {
	let next = roll()
	for (let i = 0; i < tries && next === previous; i++) next = roll()
	return next
}

export function fromNumber(min: number, max: number, step = 1) {
	if (step <= 0) {
		return (previous: number) =>
			distinct(previous, () => min + Math.random() * (max - min))
	}
	const count = Math.max(1, Math.ceil((max - min) / step))
	return (previous: number) =>
		distinct(previous, () => min + random(0, count - 1) * step)
}

export function fromEnum<T>(options: readonly T[]) {
	return (previous: T): T =>
		options.length === 0
			? previous
			: distinct(previous, () => options[random(0, options.length - 1)])
}

const DEFAULT_CHARSET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function fromString(options: {length?: number; charset?: string} = {}) {
	const length = options.length ?? 12
	const charset = options.charset ?? DEFAULT_CHARSET
	const roll = () => {
		let value = ''
		for (let i = 0; i < length; i++) {
			value += charset[random(0, charset.length - 1)]
		}
		return value
	}
	return (previous: string) => distinct(previous, roll)
}
