import {describe, expect, it} from 'vitest'

import {parseIcon} from './icon'

describe('parseIcon', () => {
	it.each([
		['char:A', {type: 'char', value: 'A'}],
		['fill:M0 0h24v24H0z', {type: 'fill', value: 'M0 0h24v24H0z'}],
		['mdi:check-bold', {type: 'iconify', value: 'mdi:check-bold'}],
		['', {type: 'iconify', value: ''}],
	] as const)('parses %j', (source, expected) => {
		expect(parseIcon(source)).toEqual(expected)
	})
})
