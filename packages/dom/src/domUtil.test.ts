import {describe, expect, it} from 'vitest'

import {addAnchorName} from './domUtil'

describe('addAnchorName', () => {
	function fakeElement() {
		const props = new Map<string, string>()
		return {
			el: {
				style: {
					setProperty: (name: string, value: string) => {
						props.set(name, value)
					},
					removeProperty: (name: string) => {
						props.delete(name)
					},
				},
			} as unknown as HTMLElement,
			get anchorName() {
				return props.get('anchor-name')
			},
		}
	}

	it('accumulates names additively and removes them individually', () => {
		const target = fakeElement()

		const disposeA = addAnchorName(target.el, '--a')
		expect(target.anchorName).toBe('--a')

		const disposeB = addAnchorName(target.el, '--b')
		expect(target.anchorName).toBe('--a, --b')

		disposeA()
		expect(target.anchorName).toBe('--b')

		disposeB()
		expect(target.anchorName).toBeUndefined()
	})

	it('refcounts duplicate names and ignores double disposal', () => {
		const target = fakeElement()

		const dispose1 = addAnchorName(target.el, '--x')
		const dispose2 = addAnchorName(target.el, '--x')

		dispose1()
		dispose1() // double dispose is a no-op
		expect(target.anchorName).toBe('--x')

		dispose2()
		expect(target.anchorName).toBeUndefined()
	})
})
