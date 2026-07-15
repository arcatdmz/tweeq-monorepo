import {unsignedMod} from './util.js'

export function updateCommandHistory(
	history: readonly string[],
	id: string,
	limit = 10
): string[] {
	return [...new Set([id, ...history])].slice(0, limit)
}

export function moveCommandSelection(
	index: number,
	direction: -1 | 1,
	length: number
): number {
	return length === 0 ? -1 : unsignedMod(index + direction, length)
}
