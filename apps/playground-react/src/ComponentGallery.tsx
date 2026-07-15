import {TweeqProvider, Viewport} from '@tweeq/react'
import {type ComponentType, type ReactNode} from 'react'

import {gallerySectionOrder} from '../../shared/galleryFixtures'

const sectionModules = import.meta.glob<{default: ComponentType}>(
	'./sections/*Section.tsx',
	{eager: true},
)

export const sections: [name: string, Component: ComponentType][] =
	Object.entries(sectionModules)
		.map(([path, mod]) => [
			path.replace('./sections/', '').replace('Section.tsx', ''),
			mod.default,
		] as [string, ComponentType])
		.sort(
			([a], [b]) =>
				gallerySectionOrder.indexOf(a as (typeof gallerySectionOrder)[number]) -
				gallerySectionOrder.indexOf(b as (typeof gallerySectionOrder)[number]),
		)

function GalleryViewport(): ReactNode {
	return (
		<Viewport
			appId="react-playground"
			className="all-components"
			data-testid="react-component-gallery"
		>
			{sections.map(([name, Section]) => (
				<div key={name} data-gallery-component={name}>
					<Section />
				</div>
			))}
			<section data-gallery-component="TweeqProvider">
				<h2>TweeqProvider</h2>
				<p>The gallery's outer runtime owner.</p>
			</section>
		</Viewport>
	)
}

export function ComponentGallery({withProvider = true}: {withProvider?: boolean}) {
	const gallery = <GalleryViewport />
	return withProvider ? (
		<TweeqProvider appId="react-playground">{gallery}</TweeqProvider>
	) : (
		gallery
	)
}
