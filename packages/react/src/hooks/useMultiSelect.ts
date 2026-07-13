import {
	type MultiSelectHandle,
	type MultiSelectSource,
} from '@tweeq/dom'
import {useCallback, useLayoutEffect, useRef} from 'react'
import {useStore} from 'zustand'

import {useTweeqRuntime} from '../runtime'

export interface MultiSelectHook
	extends Omit<MultiSelectHandle, 'dispose' | 'id'> {
	readonly id: symbol | undefined
}

/**
 * Register an input with the core multi-select store. Call `setFocusing` at the
 * focus/tweak event site; the optional `focusing` argument also keeps an
 * externally-owned focus boolean synchronized in a layout effect.
 */
export function useMultiSelect(
	source: MultiSelectSource,
	focusing?: boolean
): MultiSelectHook {
	const {multiSelectStore} = useTweeqRuntime()
	const sourceRef = useRef(source)
	sourceRef.current = source
	const handleRef = useRef<MultiSelectHandle | undefined>(undefined)

	useStore(multiSelectStore)

	useLayoutEffect(() => {
		const handle = multiSelectStore.getState().register({
			type: source.type,
			getElement: () => sourceRef.current.getElement(),
			getSpeed: source.getSpeed
				? () => sourceRef.current.getSpeed!()
				: undefined,
			getValue: () => sourceRef.current.getValue(),
			setValue: value => sourceRef.current.setValue(value),
			confirm: () => sourceRef.current.confirm(),
		})
		handleRef.current = handle
		if (focusing !== undefined) handle.setFocusing(focusing)

		return () => {
			handle.dispose()
			if (handleRef.current === handle) handleRef.current = undefined
		}
	}, [multiSelectStore, source.type])

	useLayoutEffect(() => {
		if (focusing !== undefined) handleRef.current?.setFocusing(focusing)
	}, [focusing])

	const setFocusing = useCallback((value: boolean) => {
		handleRef.current?.setFocusing(value)
	}, [])
	const capture = useCallback(() => handleRef.current?.capture(), [])
	const update = useCallback(
		(updator: (value: any, context: {i: number}) => any) =>
			handleRef.current?.update(updator),
		[]
	)
	const confirm = useCallback(() => handleRef.current?.confirm(), [])
	const handle = handleRef.current

	return {
		id: handle?.id,
		subfocus: handle?.subfocus ?? false,
		index: handle?.index ?? -1,
		readyToBeSelected: handle?.readyToBeSelected ?? false,
		multiSelected: handle?.multiSelected ?? false,
		setFocusing,
		capture,
		update,
		confirm,
	}
}
