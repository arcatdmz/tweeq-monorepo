import type {Scheme} from '../../src/react'
import {ExampleContainer} from './ExampleContainer'

export const numberScheme = {opacity: {type: 'number', min: 0, max: 100, suffix: '%'}} as Scheme<{opacity: number}>
export const angleScheme = {angle: {type: 'number', ui: 'angle'}} as unknown as Scheme<{angle: number}>
export const colorScheme = {fill: {type: 'string', ui: 'color', alpha: true}} as Scheme<{fill: string}>
export const booleanScheme = {
	switch: {type: 'boolean'}, checkbox: {type: 'boolean', ui: 'checkbox'},
} as Scheme<{switch: boolean; checkbox: boolean}>
export const positionScheme = {offset: {type: 'vec2', ui: 'position'}} as Scheme<{offset: [number, number]}>
export const timeScheme = {duration: {type: 'number', ui: 'time', frameRate: 24, min: 0}} as Scheme<{duration: number}>

export function UserStudyDemos({headings = true}: {headings?: boolean}) {
	return <div className="research-tasks">
		{headings && <h3>Task 1: Drop Shadow</h3>}
		<ExampleContainer initialValue={{offset: [0, 0] as [number, number], blur: 10, spread: 0, color: '#00000030'}} scheme={{
			offset: {type: 'vec2', ui: 'position', min: -100, max: 100}, blur: {type: 'number', min: 0, max: 100}, spread: {type: 'number', min: -100, max: 100}, color: {type: 'string', ui: 'color', alpha: true},
		} as Scheme<{offset: [number, number]; blur: number; spread: number; color: string}>} />
		{headings && <h3>Task 2: Spring Simulation</h3>}
		<ExampleContainer initialValue={{stiffness: 500, damping: 0.5}} scheme={{stiffness: {type: 'number', min: 0, max: 1000, clampMin: true, clampMax: true}, damping: {type: 'number', min: 0, max: 1, clampMin: true, clampMax: true}} as Scheme<{stiffness: number; damping: number}>} />
		{headings && <h3>Task 3: Timecode</h3>}
		<ExampleContainer initialValue={{time: 0}} scheme={{time: {type: 'number', ui: 'time', min: 0, frameRate: 24}} as Scheme<{time: number}>} />
		{headings && <h3>Task 4: Three-Point Lighting</h3>}
		<ExampleContainer initialValue={{keyIntensity: 100, keyColor: '#ffffff', fillIntensity: 100, fillColor: '#ffffff', backIntensity: 100, backColor: '#ffffff'}} scheme={{
			keyIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, keyColor: {type: 'string', ui: 'color'}, fillIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, fillColor: {type: 'string', ui: 'color'}, backIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, backColor: {type: 'string', ui: 'color'},
		} as Scheme<{keyIntensity: number; keyColor: string; fillIntensity: number; fillColor: string; backIntensity: number; backColor: string}>} />
	</div>
}
