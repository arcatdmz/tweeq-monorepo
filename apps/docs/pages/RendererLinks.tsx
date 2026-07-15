import {type Page, pageHref, vuePageHref} from '../routes'

export function RendererLinks({reactRoute}: {reactRoute: Page}) {
	return <nav className="framework-switcher" aria-label="Renderer example">
		<a aria-current="page" href={pageHref(reactRoute)}>React</a>
		<a href={vuePageHref(reactRoute)}>Vue</a>
	</nav>
}
