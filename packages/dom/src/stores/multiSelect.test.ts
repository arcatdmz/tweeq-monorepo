// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {
	createMultiSelectStore,
	getMultiSelectActions,
	moveMultiSelectAction,
	type MultiSelectStore,
} from './multiSelect'

let multiSelectStore: MultiSelectStore

beforeEach(() => {
	multiSelectStore = createMultiSelectStore()
})

afterEach(() => {
	multiSelectStore.dispose()
})

describe('multi-select controller', () => {
	it('captures, updates, confirms, and disposes a multi-selection', () => {
		let first = 2
		let second = 5
		const firstConfirm = vi.fn()
		const secondConfirm = vi.fn()
		const firstElement = document.createElement('input')
		const secondElement = document.createElement('input')
		const firstHandle = multiSelectStore.getState().register({
			type: 'number',
			getElement: () => firstElement,
			getSpeed: () => 2,
			getValue: () => first,
			setValue: value => (first = value),
			confirm: firstConfirm,
		})
		const secondHandle = multiSelectStore.getState().register({
			type: 'number',
			getElement: () => secondElement,
			getSpeed: () => 3,
			getValue: () => second,
			setValue: value => (second = value),
			confirm: secondConfirm,
		})

		firstHandle.setFocusing(true)
		firstHandle.setFocusing(false)
		window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Control'}))
		secondHandle.setFocusing(true)
		expect(multiSelectStore.getState().multiSelected).toBe(true)

		multiSelectStore.getState().captureValues()
		const add = getMultiSelectActions(
			multiSelectStore.getState().getSelectedInputs()
		).find(action => action.icon === 'material-symbols:add')
		if (!add || add.type !== 'slider') throw new Error('Missing add action')
		multiSelectStore.getState().updateValues(add.update(2))
		expect([first, second]).toEqual([6, 11])
		multiSelectStore.getState().confirmValues()
		expect(firstConfirm).toHaveBeenCalledOnce()
		expect(secondConfirm).toHaveBeenCalledOnce()

		firstHandle.dispose()
		secondHandle.dispose()
		expect(multiSelectStore.getState().getSelectedInputs()).toEqual([])
	})

	it('only offers swap for a compatible pair', () => {
		const input = (type: 'number' | 'boolean') => ({type}) as any
		expect(getMultiSelectActions([input('number'), input('number')])).toHaveLength(4)
		expect(getMultiSelectActions([input('boolean'), input('boolean')])).toEqual([])
	})

	it('maps scalar keyboard moves with standard bounds and modifiers', () => {
		expect(
			moveMultiSelectAction({type: 'slider', value: 0, key: 'ArrowRight'})
		).toBe(1)
		expect(
			moveMultiSelectAction({
				type: 'slider',
				value: 1,
				key: 'ArrowUp',
				shiftKey: true,
			})
		).toBe(11)
		expect(
			moveMultiSelectAction({
				type: 'slider',
				value: 1,
				key: 'ArrowLeft',
				altKey: true,
			})
		).toBeCloseTo(0.9)
		expect(
			moveMultiSelectAction({type: 'slider', value: 42, key: 'Home'})
		).toBe(-100)
		expect(
			moveMultiSelectAction({type: 'slider', value: 42, key: 'End'})
		).toBe(100)
		expect(
			moveMultiSelectAction({type: 'slider', value: 100, key: 'ArrowRight'})
		).toBe(100)
	})

	it('maps pad arrows to the selected value axes', () => {
		expect(
			moveMultiSelectAction({type: 'pad', value: [0, 0], key: 'ArrowRight'})
		).toEqual([1, 0])
		expect(
			moveMultiSelectAction({type: 'pad', value: [1, 0], key: 'ArrowUp'})
		).toEqual([1, -1])
		expect(
			moveMultiSelectAction({
				type: 'pad',
				value: [1, -1],
				key: 'ArrowDown',
				shiftKey: true,
			})
		).toEqual([1, 9])
		expect(
			moveMultiSelectAction({type: 'pad', value: [0, 0], key: 'Home'})
		).toBeUndefined()
	})
})
