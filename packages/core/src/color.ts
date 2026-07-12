import chroma from 'chroma-js'

import type {HSV, HSVA, RGB} from './types.js'
import {unsignedMod} from './util.js'

export type ColorChannel = 'r' | 'g' | 'b' | 'a' | 'h' | 's' | 'v'
export type ColorPicker = ColorChannel | `${ColorChannel}${ColorChannel}`
export type ColorSpace = 'rgb' | 'hsv' | 'hex'
export type ColorPickerComponent =
	| readonly [type: 'slider', axis: ColorChannel]
	| readonly [type: 'pad', axes: readonly [ColorChannel, ColorChannel]]
	| readonly [type: 'values']
	| readonly [type: 'presets']

export const DEFAULT_COLOR_PICKERS: readonly ColorPickerComponent[] = [
	['pad', ['s', 'v']],
	['slider', 'h'],
	['slider', 'a'],
	['values'],
]

export function colorChannelToIndex(channel: ColorChannel): number {
	return {r: 0, g: 1, b: 2, a: 3, h: 4, s: 5, v: 6}[channel]
}

export function rgb2hsv({r, g, b}: RGB): HSV {
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const d = max - min
	const s = max === 0 ? Number.NaN : d / max
	let h = Number.NaN

	if (max !== min) {
		if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
		else if (max === g) h = (b - r) / d + 2
		else h = (r - g) / d + 4
		h /= 6
	}

	return {h, s, v: max}
}

export function hsv2rgb({h, s, v}: HSV): RGB {
	const i = Math.floor(h * 6)
	const f = h * 6 - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)

	switch (i % 6) {
		case 0:
			return {r: v, g: t, b: p}
		case 1:
			return {r: q, g: v, b: p}
		case 2:
			return {r: p, g: v, b: t}
		case 3:
			return {r: p, g: q, b: v}
		case 4:
			return {r: t, g: p, b: v}
		default:
			return {r: v, g: p, b: q}
	}
}

export function setHSVAChannel(
	color: HSVA,
	channel: ColorChannel,
	value: number | ((oldValue: number) => number)
): HSVA {
	const update = typeof value === 'number' ? () => value : value
	const clamp = (next: number) => Math.max(0, Math.min(1, next))

	if (channel === 'h') return {...color, h: unsignedMod(update(color.h), 1)}
	if (channel === 's' || channel === 'v' || channel === 'a') {
		return {...color, [channel]: clamp(update(color[channel]))}
	}

	const rgb = hsv2rgb(color)
	rgb[channel] = clamp(update(rgb[channel]))
	const next = rgb2hsv(rgb)
	return {
		h: Number.isNaN(next.h) ? color.h : next.h,
		s: Number.isNaN(next.s) ? color.s : next.s,
		v: next.v,
		a: color.a,
	}
}

export function tweakHSVAChannel(
	color: HSVA,
	channel: ColorChannel,
	delta: number
): HSVA {
	return setHSVAChannel(color, channel, value => value + delta)
}

export function getHSVAChannel(value: HSVA, channel: ColorChannel): number {
	if (
		channel === 'h' ||
		channel === 's' ||
		channel === 'v' ||
		channel === 'a'
	) {
		return value[channel]
	}
	return hsv2rgb(value)[channel]
}

export function hsva2hex(value: HSVA): string {
	const {r, g, b} = hsv2rgb(value)
	return chroma(r * 255, g * 255, b * 255, value.a).hex()
}

export function css2hsva(value: string): HSVA {
	if (!chroma.valid(value)) return {h: 0, s: 0, v: 0, a: 1}
	const [r, g, b, a] = chroma(value).rgba()
	const hsv = rgb2hsv({r: r / 255, g: g / 255, b: b / 255})
	return {
		h: Number.isNaN(hsv.h) ? 0 : hsv.h,
		s: Number.isNaN(hsv.s) ? 0 : hsv.s,
		v: hsv.v,
		a,
	}
}

export interface InputColorPickerControllerCallbacks {
	onChange?(value: string): void
	onUpdate?(value: HSVA): void
}

/** Shared controlled-value state for the React and Vue color pickers. */
export function createInputColorPickerController(
	value: string,
	callbacks: InputColorPickerControllerCallbacks = {}
) {
	let local = css2hsva(value)
	let emitted: string | null = null
	let currentCallbacks = callbacks

	const notify = () => currentCallbacks.onUpdate?.(local)
	const emit = (next: string) => {
		emitted = next
		currentCallbacks.onChange?.(next)
	}

	return {
		get value(): HSVA {
			return local
		},
		setCallbacks(next: InputColorPickerControllerCallbacks): void {
			currentCallbacks = next
		},
		sync(next: string): void {
			if (next === emitted) return
			local = css2hsva(next)
			notify()
		},
		updateHSVA(next: HSVA): void {
			local = next
			notify()
			emit(hsva2hex(next))
		},
		updateCode(next: string): void {
			local = css2hsva(next)
			notify()
			emit(next)
		},
	}
}
