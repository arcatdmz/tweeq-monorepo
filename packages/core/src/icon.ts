export type ParsedIcon =
	| {type: 'char'; value: string}
	| {type: 'fill'; value: string}
	| {type: 'iconify'; value: string}

/** Parse Tweeq's renderer-neutral icon source convention. */
export function parseIcon(source: string): ParsedIcon {
	if (source.startsWith('char:')) {
		return {type: 'char', value: source.slice(5)}
	}
	if (source.startsWith('fill:')) {
		return {type: 'fill', value: source.slice(5)}
	}
	return {type: 'iconify', value: source}
}
