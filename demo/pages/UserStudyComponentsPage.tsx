import {InputAngle, InputColor, InputNumber, InputPosition, InputTime} from '../../src/react'
import {DemoComponent} from './DemoComponent'

export function UserStudyComponentsPage() {
	return <div {...{'vp-content': ''}} className="user-study" data-testid="user-study-components-page">
		<h1>InputNumber</h1><DemoComponent name="InputNumber" initialValue={0} options={{min: 0, max: 2, precision: 4}} scheme={{min: {type: 'number'}, max: {type: 'number'}, precision: {type: 'number', min: 0, max: 10}}}>{({modelValue, options, listeners}) => <InputNumber value={modelValue} {...options} onChange={listeners.update} />}</DemoComponent>
		<h1>InputAngle</h1><DemoComponent name="InputAngle" initialValue={0} options={{snap: 45, angleOffset: 0}} scheme={{snap: {type: 'number', min: 1, max: 360}, angleOffset: {type: 'number'}}}>{({modelValue, options, listeners}) => <InputAngle value={modelValue} {...options} onChange={listeners.update} />}</DemoComponent>
		<h1>InputColor</h1><DemoComponent name="InputColor" initialValue="#ff0000" options={{alpha: true}} scheme={{alpha: {type: 'boolean'}}}>{({modelValue, options, listeners}) => <InputColor value={modelValue} {...options} onChange={listeners.update} />}</DemoComponent>
		<h1>InputPosition</h1><DemoComponent name="InputPosition" initialValue={[0, 0] as [number, number]} options={{}} scheme={{}}>{({modelValue, listeners}) => <InputPosition value={modelValue} min={-100} max={100} onChange={listeners.update} />}</DemoComponent>
		<h1>InputTime</h1><DemoComponent name="InputTime" initialValue={0} options={{frameRate: 24, min: 0, max: 100000}} scheme={{frameRate: {type: 'number', min: 1, max: 60}, min: {type: 'number'}, max: {type: 'number'}}}>{({modelValue, options, listeners}) => <InputTime value={modelValue} {...options} onChange={listeners.update} />}</DemoComponent>
	</div>
}
