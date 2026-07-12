// The docs site's styles compiled from source, mirroring the exact import
// order of @vuepress/theme-default's client config.js (helper base CSS,
// then theme + user styles — see demo/styles/index.scss). Our chrome
// reproduces the theme's DOM (class names from its SFC sources).
import '@vuepress/helper/colors.css'
import '@vuepress/helper/normalize.css'
import './styles/index.scss'
import './demo.css'

import {createRoot} from 'react-dom/client'

import {TweeqProvider} from '../src/react'
import {DemoApp} from './DemoApp'

// NOTE: no global <Viewport> — like the original docs, the page chrome is
// plain VuePress theme; tweeq's base styles apply only inside each
// DemoContainer/Viewport (demo sandboxes and the All Components gallery).
createRoot(document.getElementById('app')!).render(
	<TweeqProvider appId="react-demo" colorMode="light">
		<DemoApp />
	</TweeqProvider>
)
