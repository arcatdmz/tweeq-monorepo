import {type ComponentType, type ReactNode} from 'react'

/**
 * Demo playground for the React port.
 *
 * Batch agents add sections WITHOUT editing this file: drop
 * `demo/sections/<Name>Section.tsx` exporting a default React component
 * (wrap it in <section data-testid="<Name>"> yourself). Files are
 * auto-discovered via import.meta.glob and rendered in filename order,
 * so Playwright tests in e2e/ can target them right away.
 */
const sectionModules = import.meta.glob<{default: ComponentType}>(
	'./sections/*Section.tsx',
	{eager: true}
)

const sections: [name: string, Component: ComponentType][] = Object.entries(
	sectionModules
)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([path, mod]) => [
		path.replace('./sections/', '').replace('Section.tsx', ''),
		mod.default,
	])

export function DemoApp(): ReactNode {
	return (
		<main>
			<h1>Tweeq React Demo</h1>
			{sections.length === 0 && (
				<p data-testid="placeholder">
					No components ported yet — sections appear here per batch.
				</p>
			)}
			{sections.map(([name, Section]) => (
				<Section key={name} />
			))}
		</main>
	)
}
