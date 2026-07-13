import {
	type MultiSelectType,
	type MultiSelectValue,
} from '@tweeq/dom'
import {reactiveComputed, unrefElement} from '@vueuse/core'
import {
	type Component,
	onBeforeUnmount,
	type Ref,
	shallowRef,
	watch,
} from 'vue'

import {useTweeqRuntime} from '../runtime'

export type {MultiSelectType}

export interface MultiSelectSource {
	type: MultiSelectType
	el: Ref<HTMLElement | Component | null>
	focusing: Readonly<Ref<boolean>>
	speed?: Readonly<Ref<number>>
	getValue: () => MultiSelectValue
	setValue: (value: any) => void
	confirm: () => void
}

const facades = new WeakMap<object, ReturnType<typeof createFacade>>()

function createFacade(
	multiSelectStore: ReturnType<typeof useTweeqRuntime>['multiSelectStore']
) {
	const revision = shallowRef(0)
	multiSelectStore.subscribe(state => {
		revision.value = state.revision
	})

	return {
		register(source: MultiSelectSource) {
			const handle = multiSelectStore.getState().register({
			type: source.type,
			getElement: () =>
				(unrefElement(source.el.value as any) as HTMLElement | null) ?? null,
			getSpeed: source.speed ? () => source.speed!.value : undefined,
			getValue: source.getValue,
			setValue: source.setValue,
			confirm: source.confirm,
			})

			watch(source.focusing, handle.setFocusing, {flush: 'sync', immediate: true})
			onBeforeUnmount(handle.dispose)

			return reactiveComputed(() => {
				void revision.value
				return {
					subfocus: handle.subfocus,
					index: handle.index,
					capture: handle.capture,
					readyToBeSelected: handle.readyToBeSelected,
					update: handle.update,
					confirm: handle.confirm,
					multiSelected: handle.multiSelected,
				}
			})
		},
		get focusedElement() {
			void revision.value
			return multiSelectStore.getState().getFocusedElement()
		},
		get selectedInputs() {
			void revision.value
			return multiSelectStore.getState().getSelectedInputs()
		},
		captureValues: () => multiSelectStore.getState().captureValues(),
		updateValues: (updator: (values: any[]) => MultiSelectValue[]) =>
			multiSelectStore.getState().updateValues(updator),
		confirmValues: () => multiSelectStore.getState().confirmValues(),
		setPopupEl: (el: HTMLElement | null) =>
			multiSelectStore.getState().setPopupEl(el),
	}
}

/** Vue lifecycle and ref facade over the shared multi-select store. */
export function useMultiSelectStore() {
	const {multiSelectStore} = useTweeqRuntime()
	let facade = facades.get(multiSelectStore)
	if (!facade) {
		facade = createFacade(multiSelectStore)
		facades.set(multiSelectStore, facade)
	}
	return facade
}
