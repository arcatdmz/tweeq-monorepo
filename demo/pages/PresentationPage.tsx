import type {Scheme} from '../../src/react'
import {ExampleContainer} from './ExampleContainer'
import {angleScheme, booleanScheme, numberScheme, positionScheme, timeScheme} from './ResearchDemos'

export function PresentationPage() {
	const mixedScheme = {...positionScheme, ...timeScheme, ...booleanScheme} as unknown as Scheme<{offset: [number, number]; duration: number; switch: boolean; checkbox: boolean}>
	return <div {...{'vp-content': ''}} className="presentation" data-testid="presentation-page">
		<ExampleContainer initialValue={{opacity: 10}} scheme={numberScheme} />
		<hr /><ExampleContainer initialValue={{color: '#0100DC'}} scheme={{color: {type: 'string', ui: 'color'}} as Scheme<{color: string}>} />
		<hr /><ExampleContainer initialValue={{angle: 0}} scheme={angleScheme} />
		<hr /><ExampleContainer initialValue={{offset: [0, 0], duration: 120, switch: true, checkbox: true}} scheme={mixedScheme} />
		<hr /><h3>Three Point Lighting</h3>
		<ExampleContainer initialValue={{keyEnabled: true, keyIntensity: 63, keyColor: '#a28fff', fillEnabled: true, fillIntensity: 28, fillColor: '#ed8d40', backEnabled: true, backIntensity: 110, backColor: '#5240fa'}} scheme={{
			keyEnabled: {type: 'boolean'}, keyIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, keyColor: {type: 'string', ui: 'color'}, fillEnabled: {type: 'boolean'}, fillIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, fillColor: {type: 'string', ui: 'color'}, backEnabled: {type: 'boolean'}, backIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, backColor: {type: 'string', ui: 'color'},
		} as Scheme<{keyEnabled: boolean; keyIntensity: number; keyColor: string; fillEnabled: boolean; fillIntensity: number; fillColor: string; backEnabled: boolean; backIntensity: number; backColor: string}>} />
	</div>
}
