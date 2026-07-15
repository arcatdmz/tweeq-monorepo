import {
	createTweeqRuntime,
	getDefaultTweeqRuntime,
	type TweeqRuntime,
} from '@tweeq/dom'
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useRef,
} from 'react'

const TweeqRuntimeContext = createContext<TweeqRuntime | undefined>(undefined)

export function useOptionalTweeqRuntime(): TweeqRuntime | undefined {
	return useContext(TweeqRuntimeContext)
}

/** Resolve the nearest app runtime, or the lazy provider-less compatibility runtime. */
export function useTweeqRuntime(): TweeqRuntime {
	return useOptionalTweeqRuntime() ?? getDefaultTweeqRuntime()
}

export interface TweeqRuntimeProviderProps extends PropsWithChildren {
	runtime: TweeqRuntime
	bind?: boolean
	disposeOnUnmount?: boolean
}

export function TweeqRuntimeProvider({
	runtime,
	bind = false,
	disposeOnUnmount = false,
	children,
}: TweeqRuntimeProviderProps) {
	const activeRuntime = useRef<TweeqRuntime | undefined>(undefined)
	useEffect(() => {
		activeRuntime.current = runtime
		const unbind = bind ? runtime.bind() : undefined
		return () => {
			if (activeRuntime.current === runtime) {
				activeRuntime.current = undefined
			}
			unbind?.()
			// React Strict Mode immediately re-runs effects in development. Defer
			// final ownership cleanup so that probe does not dispose a live runtime.
			// A different replacement runtime must not keep the old one alive.
			if (disposeOnUnmount) {
				queueMicrotask(() => {
					if (activeRuntime.current !== runtime) runtime.dispose()
				})
			}
		}
	}, [bind, disposeOnUnmount, runtime])

	return (
		<TweeqRuntimeContext.Provider value={runtime}>
			{children}
		</TweeqRuntimeContext.Provider>
	)
}

export function useOwnedTweeqRuntime(
	appId: string,
	options: Parameters<typeof createTweeqRuntime>[0] = {},
	existing?: TweeqRuntime
): TweeqRuntime {
	const runtimeRef = useRef<TweeqRuntime | null>(existing ?? null)
	runtimeRef.current ??= createTweeqRuntime({...options, appId})
	return runtimeRef.current
}
