// @vitest-environment jsdom

import {createTweeqRuntime} from '@tweeq/dom'
import {act, StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {renderToStaticMarkup} from 'react-dom/server'
import {describe, expect, it} from 'vitest'

import {TweeqRuntimeProvider, useTweeqRuntime} from './runtime'

Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true})

function Probe() {
	const runtime = useTweeqRuntime()
	return (
		<span
			data-app={runtime.appConfigStore.getState().appId}
			data-accent={runtime.themeStore.getState().accentColor}
		/>
	)
}

describe('React Tweeq runtime context', () => {
	it('resolves independent provider instances during SSR', () => {
		const first = createTweeqRuntime({appId: 'first', accentColor: '#ff0000'})
		const second = createTweeqRuntime({appId: 'second', accentColor: '#00ff00'})
		const render = (runtime: typeof first) =>
			renderToStaticMarkup(
				<TweeqRuntimeProvider runtime={runtime}>
					<Probe />
				</TweeqRuntimeProvider>
			)

		expect(render(first)).toContain('data-app="first"')
		expect(render(first)).toContain('data-accent="#ff0000"')
		expect(render(second)).toContain('data-app="second"')
		expect(render(second)).toContain('data-accent="#00ff00"')
		first.dispose()
		second.dispose()
	})

	it('survives the Strict Mode effect probe and disposes after unmount', async () => {
		const runtime = createTweeqRuntime({appId: 'strict'})
		const container = document.createElement('div')
		const root = createRoot(container)
		await act(async () => {
			root.render(
				<StrictMode>
					<TweeqRuntimeProvider runtime={runtime} bind disposeOnUnmount>
						<Probe />
					</TweeqRuntimeProvider>
				</StrictMode>
			)
		})
		expect(() => runtime.configure('still-live')).not.toThrow()
		await act(async () => root.unmount())
		await Promise.resolve()
		expect(() => runtime.configure('disposed')).toThrow('disposed')
	})

	it('disposes an owned runtime when its provider replaces it', async () => {
		const first = createTweeqRuntime({appId: 'first'})
		const second = createTweeqRuntime({appId: 'second'})
		const container = document.createElement('div')
		const root = createRoot(container)
		const render = (runtime: typeof first) =>
			root.render(
				<TweeqRuntimeProvider runtime={runtime} disposeOnUnmount>
					<Probe />
				</TweeqRuntimeProvider>
			)

		await act(async () => render(first))
		await act(async () => render(second))
		await Promise.resolve()
		expect(() => first.configure('disposed')).toThrow('disposed')
		expect(() => second.configure('still-live')).not.toThrow()

		await act(async () => root.unmount())
		await Promise.resolve()
		expect(() => second.configure('disposed')).toThrow('disposed')
	})
})
