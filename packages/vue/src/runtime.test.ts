// @vitest-environment jsdom

import {createTweeqRuntime} from '@tweeq/dom'
import {describe, expect, it} from 'vitest'
import {createApp, defineComponent, h} from 'vue'

import {TweeqRuntimeKey, useTweeqRuntime} from './runtime'
import {useThemeStore} from './stores/theme'

const Probe = defineComponent({
	setup() {
		const runtime = useTweeqRuntime()
		const theme = useThemeStore()
		return () =>
			h('span', {
				'data-app': runtime.appConfigStore.getState().appId,
				'data-accent': theme.accentColor,
			})
	},
})

describe('Vue Tweeq runtime injection', () => {
	it('resolves independent provided instances', () => {
		const mount = (appId: string, accentColor: string) => {
			const runtime = createTweeqRuntime({appId, accentColor})
			const root = document.createElement('div')
			const app = createApp(Probe)
			app.provide(TweeqRuntimeKey, runtime)
			app.mount(root)
			return {app, root, runtime}
		}
		const first = mount('first', '#ff0000')
		const second = mount('second', '#00ff00')

		expect(first.root.querySelector('span')?.dataset).toMatchObject({
			app: 'first',
			accent: '#ff0000',
		})
		expect(second.root.querySelector('span')?.dataset).toMatchObject({
			app: 'second',
			accent: '#00ff00',
		})
		first.app.unmount()
		second.app.unmount()
		first.runtime.dispose()
		second.runtime.dispose()
	})
})
