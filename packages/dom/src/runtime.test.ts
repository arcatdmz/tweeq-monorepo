// @vitest-environment jsdom

import {describe, expect, it, vi} from 'vitest'

import {createTweeqRuntime} from './runtime'

describe('Tweeq runtime ownership', () => {
	it('imports the browser entry without listeners or DOM writes', async () => {
		vi.resetModules()
		const add = vi.spyOn(document, 'addEventListener')
		const setProperty = vi.spyOn(
			CSSStyleDeclaration.prototype,
			'setProperty'
		)
		await import('./index')
		expect(add).not.toHaveBeenCalled()
		expect(setProperty).not.toHaveBeenCalled()
		add.mockRestore()
		setProperty.mockRestore()
	})

	it('isolates app config, theme, actions, and modal delegates', async () => {
		const first = createTweeqRuntime({appId: 'first'})
		const second = createTweeqRuntime({appId: 'second'})

		first.themeStore.getState().setAccentColor('#ff0000')
		expect(first.themeStore.getState().accentColor).toBe('#ff0000')
		expect(second.themeStore.getState().accentColor).toBe('#0000ff')

		const performFirst = vi.fn()
		first.actionsStore.getState().register([
			{id: 'save', label: 'Save', perform: performFirst},
		])
		expect(second.actionsStore.getState().allActions.save).toBeUndefined()
		await first.actionsStore.getState().perform('save')
		expect(performFirst).toHaveBeenCalledOnce()

		first.modalStore.getState().registerPrompt(async value => value)
		await expect(
			first.modalStore.getState().prompt({value: 1}, {value: {type: 'number'}})
		).resolves.toEqual({value: 1})
		await expect(
			second.modalStore.getState().prompt({value: 1}, {value: {type: 'number'}})
		).rejects.toThrow('No modal UI')

		first.dispose()
		second.dispose()
	})

	it('writes theme state only after an explicit bind and stops after unbind', () => {
		const root = document.createElement('div')
		const runtime = createTweeqRuntime({accentColor: '#123456'})
		expect(root.style.getPropertyValue('--tq-color-accent')).toBe('')

		const unbind = runtime.bind(root)
		expect(root.style.getPropertyValue('--tq-color-accent')).not.toBe('')
		const before = root.style.cssText
		unbind()
		runtime.themeStore.getState().setAccentColor('#abcdef')
		expect(root.style.cssText).toBe(before)
		runtime.dispose()
	})

	it('owns and removes multi-select window listeners', () => {
		const add = vi.spyOn(window, 'addEventListener')
		const remove = vi.spyOn(window, 'removeEventListener')
		const runtime = createTweeqRuntime()
		expect(add).not.toHaveBeenCalled()

		runtime.multiSelectStore.getState().register({
			type: 'number',
			getElement: () => null,
			getValue: () => 0,
			setValue: () => {},
			confirm: () => {},
		})
		expect(add).toHaveBeenCalledWith('pointerdown', expect.any(Function))
		runtime.dispose()
		expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
	})
})
