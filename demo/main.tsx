import {createRoot} from 'react-dom/client'

import {TweeqProvider} from '../src/react'
import {DemoApp} from './DemoApp'

createRoot(document.getElementById('app')!).render(
	<TweeqProvider
		appId="react-demo"
		accentColor="#7c3aed"
		backgroundColor="#ffffff"
		colorMode="light"
	>
		<DemoApp />
	</TweeqProvider>
)
