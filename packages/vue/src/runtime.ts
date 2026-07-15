import {
	getDefaultTweeqRuntime,
	type TweeqRuntime,
} from '@tweeq/dom'
import {
	getCurrentInstance,
	inject,
	type InjectionKey,
	provide,
} from 'vue'

export const TweeqRuntimeKey: InjectionKey<TweeqRuntime> = Symbol(
	'TweeqRuntime'
)

export function useOptionalTweeqRuntime(): TweeqRuntime | undefined {
	return getCurrentInstance()
		? inject(TweeqRuntimeKey, undefined)
		: undefined
}

/** Resolve the nearest app runtime, or the lazy provider-less compatibility runtime. */
export function useTweeqRuntime(): TweeqRuntime {
	return useOptionalTweeqRuntime() ?? getDefaultTweeqRuntime()
}

export function provideTweeqRuntime(runtime: TweeqRuntime): void {
	provide(TweeqRuntimeKey, runtime)
}
