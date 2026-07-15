import * as Tq from '@tweeq/react'
import type {ComponentType} from 'react'

import AllComponentsMarkdown from '../../../docs/all-components.md'
import ColorsMarkdown from '../../../docs/colors.md'
import ComponentsMarkdown from '../../../docs/components.md'
import ExampleMarkdown from '../../../docs/example.md'
import FeaturesMarkdown from '../../../docs/features.md'
import PresentationMarkdown from '../../../docs/presentation.md'
import Uist2025Markdown from '../../../docs/uist2025.md'
import UserStudyMarkdown from '../../../docs/user-study.md'
import UserStudyComponentsMarkdown from '../../../docs/user-study-components.md'
import {ComponentGallery} from '../../playground-react/src/ComponentGallery'
import type {Page} from '../routes'
import {pageHref, vuePageHref} from '../routes'
import {ColorPaletteDemo} from './ColorPaletteDemo'
import {DemoComponent} from './DemoComponent'
import {ExampleContainer} from './ExampleContainer'
import {RendererLinks} from './RendererLinks'
import {
	PresentationThreePointLighting,
	UserTestDropShadow,
	UserTestSpring,
	UserTestThreePointLighting,
	UserTestTime,
} from './ResearchDemos'

function ReactDocumentationGallery() {
	return (
		<>
			<header className="gallery-header">
				<h1>All Components</h1>
				<p>
					This exhaustive gallery contains every component in this renderer. For
					the documented, selected set with usage notes, see the{' '}
					<a href={pageHref('components')}>Components page</a>.
				</p>
				<nav className="renderer-switcher" aria-label="Renderer comparison">
					<a href={pageHref('all-components')} aria-current="page">React gallery</a>
					<a href={vuePageHref('all-components')}>Vue gallery</a>
				</nav>
			</header>
			<ComponentGallery withProvider={false} />
		</>
	)
}

const documents: Partial<Record<Page, ComponentType<any>>> = {
	features: FeaturesMarkdown,
	components: ComponentsMarkdown,
	colors: ColorsMarkdown,
	example: ExampleMarkdown,
	'all-components': AllComponentsMarkdown,
	uist2025: Uist2025Markdown,
	'user-study': UserStudyMarkdown,
	'user-study-components': UserStudyComponentsMarkdown,
	presentation: PresentationMarkdown,
}

export const markdownComponents = {
	...Tq,
	DemoComponent,
	ExampleContainer,
	ColorPaletteDemo,
	UserTestDropShadow,
	UserTestSpring,
	UserTestTime,
	UserTestThreePointLighting,
	PresentationThreePointLighting,
	ComponentGallery: ReactDocumentationGallery,
}

const testIds: Partial<Record<Page, string>> = {
	components: 'components-page',
	'all-components': 'components-page',
	colors: 'colors-page',
	example: 'examples-page',
	uist2025: 'uist2025-page',
	'user-study': 'user-study-page',
	'user-study-components': 'user-study-components-page',
	presentation: 'presentation-page',
}

export function MarkdownPage({page}: {page: Page}) {
	const Document = documents[page]
	if (!Document) return null
	return (
		<div
			className={page === 'all-components' ? 'renderer-gallery-page' : undefined}
			{...{'vp-content': ''}}
			data-testid={testIds[page]}
		>
		{['uist2025', 'user-study', 'user-study-components'].includes(page) && (
			<RendererLinks reactRoute={page} />
		)}
			<Document components={markdownComponents} />
		</div>
	)
}
