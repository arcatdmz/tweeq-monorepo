import {appConfigStore} from './stores/appConfig'
import {type ValidateResult} from './validator'

export type TimeFormat = 'frames' | 'timecode'

export const inputTimeFormatEntry = appConfigStore
	.getState()
	.group('inputTime')
	.ref<TimeFormat>('format', 'frames')

export function formatTimecode(frames: number, frameRate: number): string {
	let sign = ''
	if (frames < 0) {
		sign = '-'
		frames = -frames
	}
	const hours = Math.floor(frames / (frameRate * 3600))
	const minutes = Math.floor((frames % (frameRate * 3600)) / (frameRate * 60))
	const seconds = Math.floor((frames % (frameRate * 60)) / frameRate)
	const frame = frames % frameRate
	const pad = (value: number) => value.toString().padStart(2, '0')
	return (
		sign +
		(hours > 0
			? [hours, pad(minutes), pad(seconds), pad(frame)]
			: [pad(minutes), pad(seconds), pad(frame)]
		).join(':')
	)
}

export function parseTimecode(timecode: string, frameRate: number) {
	timecode = timecode.trim().toLowerCase()
	let sign = 1
	if (timecode.startsWith('-')) {
		sign = -1
		timecode = timecode.slice(1)
	}
	if (timecode.includes(':')) {
		const digits = timecode.split(':').map(Number).reverse()
		let frames = 0
		for (let i = 0; i < digits.length; i++) {
			const multiplier =
				i === 0 ? 1 : i === 1 ? frameRate : frameRate * 60 ** (i - 1)
			frames += digits[i] * multiplier
		}
		return sign * frames
	}
	if (/[0-9+\-.]s(ec(ond)?s?)?$/.test(timecode)) {
		const seconds = parseFloat(timecode)
		return Number.isNaN(seconds) ? null : sign * Math.round(seconds * frameRate)
	}
	if (/[0-9+\-.]m(in(ute)?s?)?$/.test(timecode)) {
		const minutes = parseFloat(timecode)
		return Number.isNaN(minutes)
			? null
			: sign * Math.round(minutes * frameRate * 60)
	}
	if (/[0-9+\-.]h((ou)?r)?s?$/.test(timecode)) {
		const hours = parseFloat(timecode)
		return Number.isNaN(hours)
			? null
			: sign * Math.round(hours * frameRate * 3600)
	}
	const frames = parseInt(timecode)
	return Number.isNaN(frames) ? null : sign * frames
}

export function replaceTimecodeWithFrames(
	expression: string,
	frameRate: number
): string {
	expression = expression.replaceAll(
		/([0-9+\-.]+:)+[0-9+\-.]+/gi,
		match => parseTimecode(match, frameRate)?.toString() ?? '0'
	)
	for (const [pattern] of [
		[/[0-9+\-.]+f(rames?)?/gi],
		[/[0-9+\-.]+s(ec(ond)?s?)?/gi],
		[/[0-9+\-.]+m(in(ute)?s?)?/gi],
		[/[0-9+\-.]+h((ou)?r)?s?/gi],
	] as const) {
		expression = expression.replaceAll(
			pattern,
			match => parseTimecode(match, frameRate)?.toString() ?? '0'
		)
	}
	return expression
}

export type TimeExpression = (
	value: number,
	context: {i: number; fps: number}
) => ValidateResult<number>

export function compileTimeExpression(
	expression: string,
	frameRate: number
): TimeExpression {
	const code = replaceTimecodeWithFrames(expression, frameRate)
	try {
		const evaluate = new Function(
			'x',
			'context',
			`const {i, fps} = context;
			try {
				const value = (${code});
				return typeof value === 'number'
					? {value, log: []}
					: {value: undefined, log: ['Value is not a number']};
			} catch (error) {
				return {value: undefined, log: [error.message]};
			}`
		) as TimeExpression
		return evaluate
	} catch (error) {
		return () => ({value: undefined, log: [(error as Error).message]})
	}
}
