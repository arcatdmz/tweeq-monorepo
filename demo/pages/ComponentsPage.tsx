import {type ComponentType} from 'react'

const notes: Record<string, string[]> = {
	InputAngle: ['Drag to adjust the angle.', 'A / drag on the line indicator sets the angle absolutely; R rotates relative to the current angle; Shift or Q snaps.'],
	InputCheckbox: ['Click to toggle the checkbox. Swipe right turns it on and swipe left turns it off.', 'T, Y, 1, or P turn it on; F, N, 0, or M turn it off.'],
	InputColor: ['Click to toggle the color picker popup.', 'Drag to tweak the color relatively; Shift/H adjusts hue, S/V saturation or brightness, Alt/A alpha, and R/G/B the corresponding channel.'],
	InputDrum: ['A horizontal “slot machine” picker: the selected option sits in the centre and its neighbours peek in at the edges. cellWidth overrides the auto-measured cell size (0 = auto).', 'Drag spins the drum, click jumps to a peeking option, the wheel and arrow keys step through options.'],
	InputNumber: ['Click to edit the number; arrow keys adjust it while focused.', 'Drag to tweak the number. Shift increases the adjustment scale, Alt decreases it, and Q snaps.'],
	InputPosition: ['Drag to adjust the position. Shift increases and Alt decreases the scale; X/0 or Y/1 constrains the tweak to an axis.'],
	InputSize: ['Click the chain icon to toggle the aspect ratio constraint.'],
	InputSwitch: ['The gestures are the same as InputCheckbox.'],
	InputTime: ['Click to edit the timecode. Right click toggles the time unit between SMTPE and frames; drag the time indicator to adjust the time.'],
}
const documented = ['InputAngle', 'InputButton', 'InputCheckbox', 'InputColor', 'InputDropdown', 'InputDrum', 'InputNumber', 'InputPosition', 'InputRadio', 'InputSize', 'InputString', 'InputSwitch', 'InputTime', 'InputVec']

export function ComponentsPage({sections}: {sections: [string, ComponentType][]}) {
	const sectionMap = new Map(sections)
	return <article className="docs-page component-docs" data-testid="component-docs-page"><h1>Components</h1>
		<h2 id="input-components">Input Components</h2>
		{documented.map(name => { const Demo = sectionMap.get(name); return <section className="component-entry" key={name}><h3 id={name.toLowerCase()}>{name}</h3>{Demo && <div className="component-demo"><Demo /></div>}{notes[name]?.map(text => <p key={text}>{text}</p>)}</section> })}
		<h2 id="common-properties">Common Properties</h2><h3>Props</h3><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>value</code></td><td><code>T</code></td><td>The model value</td></tr></tbody></table>
		<h3>Attributes</h3><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>disabled</code></td><td><code>boolean</code></td><td>Whether the input is disabled</td></tr><tr><td><code>invalid</code></td><td><code>boolean</code></td><td>Whether the input is invalid</td></tr><tr><td><code>inlinePosition</code></td><td><code>'start' | 'middle' | 'end'</code></td><td>The inline (normally horizontal) position of the input</td></tr><tr><td><code>blockPosition</code></td><td><code>'start' | 'middle' | 'end'</code></td><td>The block (normally vertical) position of the input</td></tr></tbody></table>
		<h3>Events</h3><table><thead><tr><th>Name</th><th>Payload</th><th>Description</th></tr></thead><tbody><tr><td><code>onFocus</code></td><td></td><td>Called when the input is focused or started tweaking</td></tr><tr><td><code>onChange</code></td><td><code>value: T</code></td><td>Called when the model value is updated</td></tr><tr><td><code>onConfirm</code></td><td></td><td>Called when editing or tweaking is finished</td></tr><tr><td><code>onBlur</code></td><td></td><td>Called when the input is blurred or finished tweaking</td></tr></tbody></table>
	</article>
}
