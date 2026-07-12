import type {Scheme} from '../../src/react'
import {Heading} from './docs'
import {ExampleContainer} from './ExampleContainer'
import {angleScheme, booleanScheme, colorScheme, numberScheme, positionScheme, timeScheme, UserStudyDemos} from './ResearchDemos'

const gestures: Record<string, string[]> = {
	number: ['Click: edit the number', '↑ / ↓: increase / decrease by 1', 'Shift + ↑ / ↓: increase / decrease by 10', 'Option + ↑ / ↓: increase / decrease by 0.1', 'Drag vertically: change adjustment sensitivity', 'Shift / Alt: increase / decrease sensitivity', 'Q: snap to powers of 10'],
	angle: ['A / drag the line indicator: set the angle absolutely', 'R / drag the knob: rotate relative to the current angle', 'Shift or Q: snap to multiples of 45°'],
	color: ['Click: toggle the color picker', 'Drag: tweak the color relatively', 'H / S / V: adjust hue, saturation, or value', 'A: adjust alpha', 'R / G / B: adjust a color channel'],
	boolean: ['Click: toggle the value', 'Swipe left / right: set false / true'],
	position: ['Drag: adjust the position', 'Shift / Alt: increase / decrease sensitivity', 'X / Y: constrain to an axis'],
	time: ['Click: edit the timecode', 'Right click: toggle timecode and frames', 'H / M / S / F: adjust a time unit', 'Q: change only the selected unit'],
}

function GestureList({name}: {name: keyof typeof gestures}) {
	return <><h4>Gestures</h4><ul>{gestures[name].map(item => <li key={item}><code>{item.split(':')[0]}</code>{item.includes(':') ? `:${item.split(':').slice(1).join(':')}` : ''}</li>)}</ul></>
}

export function UIST2025Page() {
	type Numbers = Record<`number${number}`, number>
	type Colors = Record<`color${number}`, string>
	type Switches = Record<`switch_${number}`, boolean>
	return <div {...{'vp-content': ''}} data-testid="uist2025-page">
		<Heading level={1} id="tweeq-parameter-tuning-gui-widgets">Tweeq: Parameter-Tuning GUI Widgets by/for Creative Professionals</Heading>
		<p><a href="https://baku89.com">Baku Hashimoto</a>†, <a href="https://junkato.jp/">Jun Kato</a>†<br /><small>† National Institute of Advanced Industrial Science and Technology (AIST), Japan</small></p>
		<blockquote><p>In Proceedings of the ACM Symposium on User Interface Software and Technology (UIST '25)<br />September 28–October 1, 2025.<br /><a href="https://doi.org/10.1145/3746059.3747723">doi.org/10.1145/3746059.3747723</a></p></blockquote>
		<ul><li><a href="https://dl.acm.org/doi/10.1145/3746059.3747723">📃 Paper</a></li><li><a href="https://programs.sigchi.org/uist/2025/program/content/206933">🗣️ Program</a></li></ul>
		<p><strong>The widgets below have been tested on Google Chrome version 134 or later.</strong></p>
		<Heading level={2} id="drag-to-tweak">4.2 Drag-to-Tweak Interaction and Overlay UI</Heading>
		<Heading level={3} id="input-number">4.2.1 InputNumber</Heading><ExampleContainer initialValue={{opacity: 10}} scheme={numberScheme} /><GestureList name="number" />
		<Heading level={3} id="rotary-knobs">4.2.2 Rotary Knobs</Heading><ExampleContainer initialValue={{angle: 0}} scheme={angleScheme} /><GestureList name="angle" />
		<Heading level={3} id="color-inputs">4.2.3 Color Inputs</Heading><ExampleContainer initialValue={{fill: '#8282ee'}} scheme={colorScheme} /><GestureList name="color" />
		<Heading level={3} id="boolean-inputs">4.2.4 Boolean Inputs</Heading><ExampleContainer initialValue={{switch: true, checkbox: true}} scheme={booleanScheme} /><GestureList name="boolean" />
		<Heading level={3} id="position-inputs">4.2.5 Other Domain-Specific Inputs (Position)</Heading><ExampleContainer initialValue={{offset: [0, 0]}} scheme={positionScheme} /><GestureList name="position" />
		<Heading level={3} id="timecode-inputs">4.2.6 Other Domain-Specific Inputs (Timecode)</Heading><ExampleContainer initialValue={{duration: 90}} scheme={timeScheme} /><GestureList name="time" />
		<Heading level={2} id="simultaneous-tuning">4.3 Simultaneous Parameter Tuning</Heading>
		<p>Click widgets while pressing <code>Ctrl</code> (Windows) or <code>Command</code> (macOS) to select multiple widgets. Hold <code>Shift</code> to select widgets in a row.</p>
		<ExampleContainer initialValue={{number1: 10, number2: 20, number3: 30, number4: 40, number5: 50} as Numbers} scheme={Object.fromEntries(Array.from({length: 5}, (_, i) => [`number${i + 1}`, {type: 'number', min: 0, max: 100}])) as Scheme<Numbers>} />
		<ExampleContainer initialValue={{color1: '#000000', color2: '#FBF4EF', color3: '#E8EAEB', color4: '#AAABAE', color5: '#975E64'} as Colors} scheme={Object.fromEntries(Array.from({length: 5}, (_, i) => [`color${i + 1}`, {type: 'string', ui: 'color'}])) as Scheme<Colors>} />
		<ExampleContainer initialValue={{switch_1: true, switch_2: false, switch_3: true, switch_4: false, switch_5: true, switch_6: false} as Switches} scheme={Object.fromEntries(Array.from({length: 6}, (_, i) => [`switch_${i + 1}`, {type: 'boolean'}])) as Scheme<Switches>} />
		<Heading level={2} id="user-study-design">6.1 User Study Design</Heading><p>These are the example applications used in the informal expert user study.</p><UserStudyDemos />
		<div style={{height: '30vh'}} />
	</div>
}
