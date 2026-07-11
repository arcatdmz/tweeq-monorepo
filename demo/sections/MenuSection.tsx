import {useState} from 'react'

import {Menu, type MenuItem} from '../../src/react'

export default function MenuSection() {
	const [result, setResult] = useState('none')
	const items: MenuItem[] = [
		{
			label: 'Run command',
			icon: 'char:▶',
			bindIcon: ['⌘', 'R'],
			perform: () => setResult('run'),
		},
		{separator: true},
		{
			label: 'More',
			children: [{label: 'Nested command', perform: () => setResult('nested')}],
		},
	]

	return (
		<section data-testid="Menu">
			<h2>Menu</h2>
			<Menu items={items} />
			<output data-testid="menu-result">{result}</output>
		</section>
	)
}
