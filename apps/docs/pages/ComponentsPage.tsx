import {
	InputAngle, InputButton, InputCheckbox, InputColor, InputDropdown, InputDrum,
	InputNumber, InputPosition, InputRadio, InputSize, InputString, InputSwitch,
	InputTime, InputVec, type Scheme,
} from '@tweeq/react'

import {DemoComponent, useAnchorScroll} from './DemoComponent'
import {Heading} from './docs'

/**
 * Port of docs/components.md. Each entry mirrors the markdown source: an h3
 * anchor, a <DemoComponent> with the SAME name/initialValue/options/scheme
 * as the original, and the interaction notes below it.
 */

export function ComponentsPage() {
	useAnchorScroll()
	return (
		<div {...{'vp-content': ''}}>
			<Heading level={1} id="components">
				Components
			</Heading>
			<p>
				This page presents a selected set of components with their options and
				interaction notes. To browse every component included in the React port,
				open the <a href="#/all-components">All Components gallery</a>.
			</p>

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

			<Heading level={3} id="inputcheckbox">InputCheckbox</Heading>
			<DemoComponent name="InputCheckbox" initialValue={false} options={{label: '', icon: ''}} scheme={{label: {type: 'string'}, icon: {type: 'string'}} as Scheme<{label: string; icon: string}>}>
				{({modelValue, options, listeners}) => <InputCheckbox value={modelValue as boolean} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Click</code>: toggle the checkbox</li><li><code>Swipe Right</code>: turn on the checkbox</li><li><code>Swipe Left</code>: turn off the checkbox</li><li><code>T</code> or <code>Y</code> or <code>1</code> or <code>p</code>: turn on the checkbox</li><li><code>F</code> or <code>N</code> or <code>0</code> or <code>m</code>: turn off the checkbox</li></ul>

			<Heading level={3} id="inputcolor">InputColor</Heading>
			<DemoComponent name="InputColor" initialValue="#ff0000" options={{alpha: true}} scheme={{alpha: {type: 'boolean'}} as Scheme<{alpha: boolean}>}>
				{({modelValue, options, listeners}) => <InputColor value={modelValue as string} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Click</code>: toggle the color picker popup</li><li><code>Drag</code>: tweak the color relatively<ul><li><code>Shift</code> or <code>H</code>: adjust the hue</li><li><code>S</code> / <code>V</code>: adjust the saturation / brightness (value)</li><li><code>Alt</code> or <code>A</code>: adjust the alpha</li><li><code>R</code> / <code>G</code> / <code>B</code>: adjust the red / green / blue channel</li></ul></li></ul>

			<Heading level={3} id="inputdropdown">InputDropdown</Heading>
			<DemoComponent name="InputDropdown" initialValue="apple" options={{disabled: false, invalid: false}} scheme={{disabled: {type: 'boolean'}, invalid: {type: 'boolean'}} as Scheme<{disabled: boolean; invalid: boolean}>}>
				{({modelValue, options, listeners}) => <InputDropdown value={modelValue as string} options={['apple', 'banana', 'cherry']} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>

			<Heading level={3} id="inputdrum">InputDrum</Heading>
			<DemoComponent name="InputDrum" initialValue="apple" options={{cellWidth: 0, prefix: '', suffix: '', disabled: false, invalid: false}} scheme={{cellWidth: {type: 'number', min: 0, step: 1}, prefix: {type: 'string'}, suffix: {type: 'string'}, disabled: {type: 'boolean'}, invalid: {type: 'boolean'}} as Scheme<{cellWidth: number; prefix: string; suffix: string; disabled: boolean; invalid: boolean}>}>
				{({modelValue, options, listeners}) => <InputDrum value={modelValue as string} options={['apple', 'banana', 'cherry']} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<p>A horizontal &quot;slot machine&quot; picker: the selected option sits in the centre and its neighbours peek in at the edges. <code>cellWidth</code> overrides the auto-measured cell size (0 = auto).</p>
			<ul><li><code>Drag</code>: spin the drum to neighbouring options</li><li><code>Click</code>: jump to a peeking option</li><li><code>Wheel</code>: step through the options</li><li><code>←</code> / <code>↑</code>: previous option</li><li><code>→</code> / <code>↓</code>: next option</li></ul>

			<Heading level={3} id="inputnumber">InputNumber</Heading>
			<DemoComponent name="InputNumber" initialValue={0} options={{min: 0, max: 2, clampMin: false, clampMax: false, step: 0, precision: 4, prefix: '', suffix: '', disabled: false, invalid: false, leftIcon: '', rightIcon: '', bar: 0}} scheme={{min: {type: 'number'}, max: {type: 'number'}, bar: {type: 'number'}, clampMin: {type: 'boolean'}, clampMax: {type: 'boolean'}, step: {type: 'number', min: 0}, precision: {type: 'number', min: 0, max: 10, step: 1, clampMin: true, clampMax: true}, disabled: {type: 'boolean'}, invalid: {type: 'boolean'}, prefix: {type: 'string'}, suffix: {type: 'string'}, leftIcon: {type: 'string'}, rightIcon: {type: 'string'}} as unknown as Scheme<{min: number; max: number; bar: number; clampMin: boolean; clampMax: boolean; step: number; precision: number; disabled: boolean; invalid: boolean; prefix: string; suffix: string; leftIcon: string; rightIcon: string}>}>
				{({modelValue, options, listeners}) => <InputNumber value={modelValue as number} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Click</code>: edit the number</li><li>While focusing<ul><li><code>↑</code> / <code>↓</code>: increase / decrease the number by 1</li><li><code>Shift + ↑</code> / <code>Shift + ↓</code>: increase / decrease the number by <code>snap</code></li><li><code>Option + ↑</code> / <code>Option + ↓</code>: increase / decrease the number by 0.1</li><li><code>Command + =</code>: enable expression mode</li></ul></li><li><code>Drag</code>: tweak the number<ul><li>Drag vertically: increase and decrease the scale of adjustment</li><li><code>Shift</code>: increase the scale of adjustment</li><li><code>Alt</code>: decrease the scale of adjustment</li><li><code>Q</code>: snap to the times of <code>snap</code></li></ul></li></ul>

			<Heading level={3} id="inputposition">InputPosition</Heading>
			<DemoComponent name="InputPosition" initialValue={[0, 0]} options={{}} scheme={{} as Scheme<Record<string, never>>}>
				{({modelValue, options, listeners}) => <InputPosition value={modelValue as [number, number]} {...options} min={-100} max={100} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Drag</code>: adjust the position<ul><li><code>Shift</code>: increase the scale of adjustment</li><li><code>Alt</code>: decrease the scale of adjustment</li><li><code>X</code> / <code>0</code>: constrain the tweak to the X axis</li><li><code>Y</code> / <code>1</code>: constrain the tweak to the Y axis</li></ul></li></ul>

			<Heading level={3} id="inputradio">InputRadio</Heading>
			<DemoComponent name="InputRadio" initialValue="apple" options={{}} scheme={{} as Scheme<Record<string, never>>}>
				{({modelValue, listeners}) => <InputRadio value={modelValue as string} options={['apple', 'banana', 'cherry']} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>

			<Heading level={3} id="inputsize">InputSize</Heading>
			<DemoComponent name="InputSize" initialValue={[100, 250]} options={{}} scheme={{} as Scheme<Record<string, never>>}>
				{({modelValue, options, listeners}) => <InputSize value={modelValue as [number, number]} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Click</code> on the chain icon: toggle the aspect ratio constraint</li></ul>

			<Heading level={3} id="inputstring">InputString</Heading>
			<DemoComponent name="InputString" initialValue="Baby salmon" options={{disabled: false, invalid: false}} scheme={{disabled: {type: 'boolean'}, invalid: {type: 'boolean'}} as Scheme<{disabled: boolean; invalid: boolean}>}>
				{({modelValue, options, listeners}) => <InputString value={modelValue as string} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>

			<Heading level={3} id="inputswitch">InputSwitch</Heading>
			<DemoComponent name="InputSwitch" initialValue={false} options={{label: ''}} scheme={{label: {type: 'string'}} as Scheme<{label: string}>}>
				{({modelValue, options, listeners}) => <InputSwitch value={modelValue as boolean} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li>The gestures are the same as <a href="#inputcheckbox">InputCheckbox</a></li></ul>

			<Heading level={3} id="inputtime">InputTime</Heading>
			<DemoComponent name="InputTime" initialValue={0} options={{frameRate: 24, min: 0, max: 100000}} scheme={{frameRate: {type: 'number', min: 1, max: 60, step: 1}, min: {type: 'number'}, max: {type: 'number'}} as unknown as Scheme<{frameRate: number; min: number; max: number}>}>
				{({modelValue, options, listeners}) => <InputTime value={modelValue as number} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>
			<ul><li><code>Click</code>: edit the timecode</li><li><code>Right Click</code>: toggle the time unit between SMTPE and frames</li><li><code>Drag</code> on the time indicator: adjust the time<ul><li><code>Shift</code>: increase the scale of adjustment</li><li><code>Alt</code>: decrease the scale of adjustment</li><li><code>H</code> / <code>M</code> / <code>S</code> / <code>F</code>: adjust the hour / minute / second / frame</li><li><code>Q</code>: only change the currently selected unit</li></ul></li></ul>

			<Heading level={3} id="inputvec">InputVec</Heading>
			<DemoComponent name="InputVec" initialValue={[0, 0, 0, 0]} options={{}} scheme={{} as Scheme<Record<string, never>>}>
				{({modelValue, options, listeners}) => <InputVec value={modelValue as number[]} {...options} onChange={listeners.update} onFocus={listeners.focus} onBlur={listeners.blur} onConfirm={listeners.confirm} />}
			</DemoComponent>

			<Heading level={2} id="common-properties">Common Properties</Heading>
			<Heading level={3} id="props">Props</Heading>
			<table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>value</code></td><td><code>T</code></td><td>The model value</td></tr></tbody></table>
			<Heading level={3} id="attributes">Attributes</Heading>
			<table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>disabled</code></td><td><code>boolean</code></td><td>Whether the input is disabled</td></tr><tr><td><code>invalid</code></td><td><code>boolean</code></td><td>Whether the input is invalid</td></tr><tr><td><code>inlinePosition</code></td><td><code>&apos;start&apos; | &apos;middle&apos; | &apos;end&apos;</code></td><td>The inline (normally horizontal) position of the input</td></tr><tr><td><code>blockPosition</code></td><td><code>&apos;start&apos; | &apos;middle&apos; | &apos;end&apos;</code></td><td>The block (normally vertical) position of the input</td></tr></tbody></table>
			<Heading level={3} id="events">Events</Heading>
			<table><thead><tr><th>Name</th><th>Payload</th><th>Description</th></tr></thead><tbody><tr><td><code>onFocus</code></td><td /><td>Called when the input is focused or started tweaking</td></tr><tr><td><code>onChange</code></td><td><code>value: T</code></td><td>Called when the model value is updated</td></tr><tr><td><code>onConfirm</code></td><td /><td>Called when the editing or tweaking is finished</td></tr><tr><td><code>onBlur</code></td><td /><td>Called when the input is blurred or finished tweaking</td></tr></tbody></table>
		</div>
	)
}
