import './demo.css'

import {createRoot} from 'react-dom/client'

import {TweeqProvider, Viewport} from '../src/react'
import {DemoApp} from './DemoApp'

// Like the legacy Vue toolkit, ALL base styles (font, reset, selection,
// scrollbars — reset-viewport() in common.styl) are scoped to <Viewport>'s
// .TqViewport subtree. TweeqProvider alone only provides stores/overlay roots.
createRoot(document.getElementById('app')!).render(
	<TweeqProvider
		appId="react-demo"
		accentColor="#7c3aed"
		backgroundColor="#ffffff"
		colorMode="light"
	>
		<Viewport appId="react-demo">
			<DemoApp />
		</Viewport>
	</TweeqProvider>
)
