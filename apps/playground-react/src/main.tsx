import '@tweeq/react/style.css'
import '../../shared/gallery.css'

import {createRoot} from 'react-dom/client'

import {ComponentGallery} from './ComponentGallery'

const docsBase = import.meta.env.DEV ? 'http://127.0.0.1:5174/' : '/tweeq/'
const vueGalleryHref = import.meta.env.DEV
	? 'http://127.0.0.1:5175/'
	: '/tweeq/vue/'

createRoot(document.getElementById('app')!).render(
	<main className="renderer-gallery-page standalone-gallery-page">
		<header className="gallery-header">
			<h1>All Components</h1>
			<p>
				This exhaustive gallery contains every component in this renderer. For
				the documented, selected set with usage notes, see the{' '}
				<a href={`${docsBase}#/components`}>Components page</a>.
			</p>
			<nav className="renderer-switcher" aria-label="Renderer comparison">
				<a href="./" aria-current="page">React gallery</a>
				<a href={vueGalleryHref}>Vue gallery</a>
			</nav>
		</header>
		<ComponentGallery />
	</main>,
)
