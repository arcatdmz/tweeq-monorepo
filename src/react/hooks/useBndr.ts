import * as Bndr from 'bndr-js'
import {type DependencyList, type RefObject, useEffect, useRef} from 'react'

function sameDependencies(a: DependencyList, b: DependencyList): boolean {
	return a.length === b.length && a.every((value, i) => Object.is(value, b[i]))
}

/** Run a bndr-js scope for the mounted element and dispose it on cleanup. */
export function useBndr<T extends Element>(
	target: RefObject<T | null>,
	setup: (element: T) => void,
	dependencies: DependencyList = []
): void {
	const setupRef = useRef(setup)
	setupRef.current = setup
	const record = useRef<
		| {
				element: T
				dependencies: DependencyList
				dispose: () => void
		  }
		| undefined
	>(undefined)

	// Check after every commit so replacing the node behind a stable ref also
	// replaces its bndr scope. Dependencies control setup re-creation explicitly.
	useEffect(() => {
		const element = target.current
		const current = record.current
		if (
			current?.element === element &&
			sameDependencies(current.dependencies, dependencies)
		) {
			return
		}

		current?.dispose()
		record.current = undefined
		if (!element) return

		record.current = {
			element,
			dependencies: [...dependencies],
			dispose: Bndr.createScope(() => setupRef.current(element)),
		}
	})

	useEffect(() => {
		return () => {
			record.current?.dispose()
			record.current = undefined
		}
	}, [])
}
