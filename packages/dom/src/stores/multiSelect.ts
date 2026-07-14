import type {HSVA} from '@tweeq/core'
import {
	type Rect,
	rectCenter,
	rectsIntersect,
	uniteRects,
} from '@tweeq/core'
import {vec2} from 'linearly'
import {createStore, type StoreApi} from 'zustand/vanilla'

import {nodeContains, rectFromDOMRect} from '../domUtil.js'

export type MultiSelectType = 'number' | 'color' | 'string' | 'boolean'

export type MultiSelectValue = number | string | boolean | HSVA

export const MULTI_SELECT_KEYBOARD_MIN = -100
export const MULTI_SELECT_KEYBOARD_MAX = 100

export type MultiSelectKeyboardValue = number | readonly [number, number]

export interface MultiSelectKeyboardMove {
	type: 'slider' | 'pad'
	value: MultiSelectKeyboardValue
	key: string
	shiftKey?: boolean
	altKey?: boolean
}

/**
 * Resolve one keyboard move for a relative multi-select action. Scalar actions
 * follow the ARIA slider key model; the pad maps horizontal arrows to the
 * first selected value and vertical arrows to the second. Shift accelerates
 * to ten units and Alt provides a tenth-unit fine adjustment.
 */
export function moveMultiSelectAction({
	type,
	value,
	key,
	shiftKey = false,
	altKey = false,
}: MultiSelectKeyboardMove): MultiSelectKeyboardValue | undefined {
	const step = altKey ? 0.1 : shiftKey ? 10 : 1
	const clamp = (next: number) =>
		Math.min(MULTI_SELECT_KEYBOARD_MAX, Math.max(MULTI_SELECT_KEYBOARD_MIN, next))

	if (type === 'slider') {
		if (typeof value !== 'number') return undefined
		if (key === 'Home') return MULTI_SELECT_KEYBOARD_MIN
		if (key === 'End') return MULTI_SELECT_KEYBOARD_MAX

		const direction =
			key === 'ArrowLeft' || key === 'ArrowDown' || key === 'PageDown'
				? -1
				: key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp'
					? 1
					: 0
		if (direction === 0) return undefined

		const amount = key === 'PageDown' || key === 'PageUp' ? 10 : step
		return clamp(value + direction * amount)
	}

	if (typeof value === 'number') return undefined
	const [x, y] = value
	switch (key) {
		case 'ArrowLeft':
			return [clamp(x - step), y]
		case 'ArrowRight':
			return [clamp(x + step), y]
		case 'ArrowUp':
			return [x, clamp(y - step)]
		case 'ArrowDown':
			return [x, clamp(y + step)]
		default:
			return undefined
	}
}

/**
 * What an input component registers with the store. The legacy Vue version
 * took refs (`el`, `focusing`, `speed`); the framework-neutral port takes
 * getters instead, and focus changes are reported imperatively through the
 * returned handle's `setFocusing` (the adapter hook wires this to the
 * component's focus state).
 */
export interface MultiSelectSource {
	type: MultiSelectType
	getElement: () => HTMLElement | null
	/** Value change per horizontal drag pixel (used by the multi-select popup). */
	getSpeed?: () => number
	getValue: () => MultiSelectValue
	setValue: (value: any) => void
	confirm: () => void
}

export interface MultiSelectInput {
	readonly id: symbol
	readonly type: MultiSelectType
	readonly element: HTMLElement | null
	readonly speed: number | undefined
	readonly focusing: boolean
	capturedValue: MultiSelectValue | undefined
	getValue(): MultiSelectValue
	setValue(value: any): void
	confirm(): void
}

export type MultiSelectAction =
	| {
			type: 'slider'
			icon: string
			label: string
			update: (pixels: number) => (values: number[]) => number[]
	  }
	| {
			type: 'pad'
			icon: string
			label: string
			update: (
				delta: readonly [number, number]
			) => (values: number[]) => number[]
	  }
	| {
			type: 'button'
			icon: string
			label: string
			update: (values: any[]) => any[]
	  }

/** Build the actions valid for the current heterogeneous selection. */
export function getMultiSelectActions(
	selected: readonly MultiSelectInput[]
): MultiSelectAction[] {
	const types = selected.map(input => input.type)
	const actions: Array<MultiSelectAction & {enabled: boolean}> = [
		{
			type: 'slider',
			enabled: types.every(type => type === 'number'),
			update: pixels => values =>
				values.map(
					(value, index) => value + pixels * (selected[index]?.speed ?? 1)
				),
			icon: 'material-symbols:add',
			label: 'Add to selected values',
		},
		{
			type: 'slider',
			enabled: types.every(type => type === 'number'),
			update: pixels => values =>
				values.map(value => value * (pixels / 100 + 1)),
			icon: 'mdi:multiply',
			label: 'Scale selected values',
		},
		{
			type: 'pad',
			enabled: types.length === 2 && types.every(type => type === 'number'),
			update: delta => values => [
				values[0] + delta[0] * (selected[0]?.speed ?? 1),
				values[1] - delta[1] * (selected[1]?.speed ?? 1),
			],
			icon: 'mdi:dots-grid',
			label: 'Adjust selected pair',
		},
		{
			type: 'button',
			enabled:
				types.length === 2 &&
				types[0] !== 'boolean' &&
				types[0] === types[1],
			update: values => [...values].reverse(),
			icon: 'material-symbols:swap-vert',
			label: 'Swap selected values',
		},
	]
	return actions.flatMap(({enabled, ...action}) => (enabled ? [action] : []))
}

/**
 * Returned by `register`. The reactive fields of the legacy version
 * (`subfocus`, `index`, `readyToBeSelected`, `multiSelected`) are getters
 * that read the current store state; subscribe to the store to observe them.
 */
export interface MultiSelectHandle {
	readonly id: symbol
	/** Selected as part of a multi-selection while not being directly focused. */
	readonly subfocus: boolean
	/** Position within the current selection (-1 when not selected). */
	readonly index: number
	/** A modifier is held and this input is not yet part of the selection. */
	readonly readyToBeSelected: boolean
	readonly multiSelected: boolean
	/** Report the input's focus (or tweak) state; drives the selection logic. */
	setFocusing(focusing: boolean): void
	/** Capture the current values of every selected input (== `captureValues`). */
	capture(): void
	/** Apply an updator to every *other* selected input of the same type. */
	update(updator: (value: any, context: {i: number}) => any): void
	/** Confirm every *other* selected input. */
	confirm(): void
	/** Unregister the input (the legacy `onBeforeUnmount`). */
	dispose(): void
}

export interface MultiSelectState {
	/** Selection in click order; the last id is the primary (focused) input. */
	selectedIds: readonly symbol[]
	multiSelected: boolean
	shift: boolean
	ctrlOrCommand: boolean
	/** Bumped when inputs register/dispose or change focus/captured values. */
	revision: number

	register(source: MultiSelectSource): MultiSelectHandle
	captureValues(): void
	updateValues(updator: (values: any[]) => MultiSelectValue[]): void
	confirmValues(): void
	defocusAll(): void
	setPopupEl(el: HTMLElement | null): void
	getSelectedInputs(): MultiSelectInput[]
	getFocusedElement(): HTMLElement | null
}

interface InputImpl extends MultiSelectInput {
	focusing: boolean
}

export interface MultiSelectStore extends StoreApi<MultiSelectState> {
	dispose(): void
}

/** Create one isolated selection registry and browser-listener lifecycle. */
export function createMultiSelectStore(): MultiSelectStore {
	const inputs = new Map<symbol, InputImpl>()
	let popupEl: HTMLElement | null = null
	let meta = false
	let control = false
	let shift = false
	let listenersAttached = false
	let detachListeners = () => {}

	const store = createStore<MultiSelectState>((set, get) => {
	function bump() {
		set(state => ({revision: state.revision + 1}))
	}

	function getSelectedInputs(): MultiSelectInput[] {
		return get()
			.selectedIds.map(id => inputs.get(id))
			.filter((input): input is InputImpl => input !== undefined)
	}

	function getFocusedElement(): HTMLElement | null {
		const id = get().selectedIds.at(-1)

		if (!id) return null

		const input = inputs.get(id)

		if (!input) return null

		return input.element
	}

	function setSelectedIds(selectedIds: readonly symbol[]) {
		set({selectedIds, multiSelected: selectedIds.length > 1})
	}

	function selectId(id: symbol) {
		// Move the id to the end (= primary) keeping click order.
		setSelectedIds([...get().selectedIds.filter(i => i !== id), id])
	}

	function defocusAll() {
		setSelectedIds([])
	}

	function selectInbetween(start: Rect, end: Rect) {
		const startCenter = rectCenter(start)
		const endCenter = rectCenter(end)
		const direction = vec2.sub(endCenter, startCenter)

		const selectionRect = uniteRects(start, end)

		const inbetweenIds: {id: symbol; order: number}[] = []

		inputs.forEach(input => {
			const el = input.element
			if (!el) return

			const rect = rectFromDOMRect(el.getBoundingClientRect())

			if (rectsIntersect(selectionRect, rect)) {
				const center = rectCenter(rect)
				const order = vec2.dot(vec2.sub(center, startCenter), direction)

				inbetweenIds.push({id: input.id, order})
			}
		})

		inbetweenIds.sort((a, b) => a.order - b.order)
		inbetweenIds.forEach(({id}) => selectId(id))
	}

	function updateModifiers() {
		const ctrlOrCommand = meta || control
		const state = get()
		if (state.shift !== shift || state.ctrlOrCommand !== ctrlOrCommand) {
			set({shift, ctrlOrCommand})
		}
	}

	function onPointerDown(e: PointerEvent) {
		// Ignore non-primary pointer
		if (e.button !== 0) return

		const target = e.target as Node

		// Defocus all when clicking outside of the selected inputs, except for
		// clicks landing on the multi-select popup or with a modifier pressed.
		const clickedOutside = !getSelectedInputs().some(({element}) => {
			return element && nodeContains(element, target)
		})

		const clickedPopup = popupEl && nodeContains(popupEl, target)

		const {shift, ctrlOrCommand} = get()
		const modifierPressed = ctrlOrCommand || shift

		if (clickedOutside && !clickedPopup && !modifierPressed) {
			defocusAll()
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Meta') meta = true
		if (e.key === 'Control') control = true
		if (e.key === 'Shift') shift = true
		updateModifiers()

		// Defocus all when pressing Escape or Tab
		if (e.key === 'Escape' || e.key === 'Tab') {
			defocusAll()
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		if (e.key === 'Meta') meta = false
		if (e.key === 'Control') control = false
		if (e.key === 'Shift') shift = false
		updateModifiers()
	}

	function onWindowBlur() {
		meta = control = shift = false
		updateModifiers()
	}

	function ensureListeners() {
		if (listenersAttached || typeof window === 'undefined') return
		listenersAttached = true

		window.addEventListener('pointerdown', onPointerDown)
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('blur', onWindowBlur)
	}

	detachListeners = () => {
		if (!listenersAttached || typeof window === 'undefined') return
		window.removeEventListener('pointerdown', onPointerDown)
		window.removeEventListener('keydown', onKeyDown)
		window.removeEventListener('keyup', onKeyUp)
		window.removeEventListener('blur', onWindowBlur)
		listenersAttached = false
	}

	// Entry point for multi select for each input component
	function register(source: MultiSelectSource): MultiSelectHandle {
		ensureListeners()

		const id = Symbol()

		const input: InputImpl = {
			id,
			type: source.type,
			get element() {
				return source.getElement()
			},
			get speed() {
				return source.getSpeed?.()
			},
			focusing: false,
			capturedValue: undefined,
			getValue: source.getValue,
			setValue: source.setValue,
			confirm: source.confirm,
		}

		inputs.set(id, input)
		bump()

		const isSelected = () => get().selectedIds.includes(id)

		// "Selected via multi-select but not directly focused"
		const subfocus = () => isSelected() && !input.focusing

		function setFocusing(focusing: boolean) {
			if (input.focusing === focusing) return

			input.focusing = focusing
			bump()

			if (!focusing) return

			const {shift, ctrlOrCommand} = get()

			// If shift is pressed, select the inputs inbetween the previously
			// focused input and the newly focused one
			const focusedElement = getFocusedElement()
			const el = input.element

			if (shift && focusedElement && el) {
				const lastRect = rectFromDOMRect(
					focusedElement.getBoundingClientRect()
				)
				const newRect = rectFromDOMRect(el.getBoundingClientRect())

				selectInbetween(lastRect, newRect)
			}

			// NOTE: `subfocus()` is always false here (focusing was just set to
			// true) — kept for parity with the legacy watch, which evaluated its
			// computed after the focus ref had already changed.
			if (!subfocus() && !ctrlOrCommand && !shift) {
				defocusAll()
			}

			if (!subfocus()) {
				selectId(id)
			}
		}

		function update(updator: (value: any, context: {i: number}) => any) {
			getSelectedInputs().forEach((other, i) => {
				if (other.id === id || other.type !== source.type) return

				const context = {i}

				const newValue = updator(
					other.capturedValue ?? other.getValue(),
					context
				)

				other.setValue(newValue)
			})
		}

		function confirm() {
			getSelectedInputs().forEach(other => {
				if (other.id === id) return
				other.confirm()
			})
		}

		function dispose() {
			inputs.delete(id)
			// Also drop the id from the selection so stale symbols don't linger
			// (the legacy store left them and filtered on read).
			if (isSelected()) {
				setSelectedIds(get().selectedIds.filter(i => i !== id))
			}
			bump()
		}

		return {
			id,
			get subfocus() {
				return subfocus()
			},
			get index() {
				return getSelectedInputs().findIndex(input => input.id === id)
			},
			get readyToBeSelected() {
				const {shift, ctrlOrCommand} = get()
				return (ctrlOrCommand || shift) && !isSelected()
			},
			get multiSelected() {
				return get().multiSelected
			},
			setFocusing,
			capture: captureValues,
			update,
			confirm,
			dispose,
		}
	}

	function captureValues() {
		getSelectedInputs().forEach(input => {
			input.capturedValue = input.getValue()
		})
		bump()
	}

	function updateValues(updator: (values: any[]) => MultiSelectValue[]) {
		const selectedInputs = getSelectedInputs()

		const values = selectedInputs.map(
			input => input.capturedValue ?? input.getValue()
		)

		const updatedValues = updator(values)

		selectedInputs.forEach((input, i) => {
			input.setValue(updatedValues[i])
		})
	}

	function confirmValues() {
		getSelectedInputs().forEach(input => {
			input.confirm()
			input.capturedValue = undefined
		})
		bump()
	}

	return {
		selectedIds: [],
		multiSelected: false,
		shift: false,
		ctrlOrCommand: false,
		revision: 0,

		register,
		captureValues,
		updateValues,
		confirmValues,
		defocusAll,
		setPopupEl: el => {
			popupEl = el
		},
		getSelectedInputs,
		getFocusedElement,
	}
	})

	return Object.assign(store, {
		dispose() {
			detachListeners()
			inputs.clear()
			popupEl = null
			meta = control = shift = false
			store.setState({
				selectedIds: [],
				multiSelected: false,
				shift: false,
				ctrlOrCommand: false,
				revision: store.getState().revision + 1,
			})
		},
	})
}
