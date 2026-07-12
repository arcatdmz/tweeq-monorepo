import {type ComponentType} from 'react'

import {InputAngle, InputButton, type Scheme} from '../../src/react'
import {DemoComponent, useAnchorScroll} from './DemoComponent'
import {Heading} from './docs'

/**
 * Port of docs/components.md. Each entry mirrors the markdown source: an h3
 * anchor, a <DemoComponent> with the SAME name/initialValue/options/scheme
 * as the original, and the interaction notes below it.
 *
 * TODO(codex): complete the remaining entries 1:1 from docs/components.md,
 * following the InputAngle/InputButton exemplars below (including the
 * definition-list interaction notes rendered as the markdown would be).
 */

export function ComponentsPage(_props: {
	sections?: [string, ComponentType][]
}) {
	useAnchorScroll()
	return (
		<div {...{'vp-content': ''}}>
			<Heading level={1} id="components">
				Components
			</Heading>

			<Heading level={2} id="input-components">
				Input Components
			</Heading>

			<Heading level={3} id="inputangle">
				InputAngle
			</Heading>
			<DemoComponent
				name="InputAngle"
				initialValue={0}
				options={{snap: 45, angleOffset: 0}}
				scheme={
					{
						snap: {
							type: 'number',
							step: 1,
							min: 1,
							max: 360,
							snap: 5,
							suffix: '°',
						},
						angleOffset: {
							type: 'number',
							ui: 'angle',
							step: 1,
							min: -180,
							max: 180,
						},
					// InputAngleProps doesn't expose every passthrough prop the legacy
					// docs set (e.g. step) — cast like ExamplesPage does.
					} as unknown as Scheme<{snap: number; angleOffset: number}>
				}
			>
				{({modelValue, options, listeners}) => (
					<InputAngle
						value={modelValue as number}
						onChange={listeners.update}
						onFocus={listeners.focus}
						onBlur={listeners.blur}
						onConfirm={listeners.confirm}
						{...options}
					/>
				)}
			</DemoComponent>
			<ul>
				<li>
					<code>Drag</code>
					<ul>
						<li>
							<code>A</code> / Drag on the line indicator: set the angle
							absolutely
						</li>
						<li>
							<code>R</code> / Drag the remaining part of the knob: rotate it
							relative to the current angle
						</li>
						<li>
							<code>Shift</code> or <code>Q</code>: snap to the times of{' '}
							<code>snap</code>
						</li>
					</ul>
				</li>
			</ul>

			<Heading level={3} id="inputbutton">
				InputButton
			</Heading>
			<DemoComponent
				name="InputButton"
				initialValue={0}
				options={{label: 'Click me', icon: '', subtle: false, blink: false}}
				scheme={
					{
						label: {type: 'string'},
						icon: {type: 'string'},
						subtle: {type: 'boolean'},
						blink: {type: 'boolean'},
					} as Scheme<{
						label: string
						icon: string
						subtle: boolean
						blink: boolean
					}>
				}
			>
				{({options}) => <InputButton {...options} />}
			</DemoComponent>
		</div>
	)
}
