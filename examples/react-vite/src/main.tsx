import '@tweeq/react/style.css'

import {
	InputNumber,
	InputString,
	TweeqProvider,
	Viewport,
} from '@tweeq/react'
import {useState} from 'react'
import {createRoot} from 'react-dom/client'

function ExampleApp() {
	const [size, setSize] = useState(1)
	const [name, setName] = useState('tweeq')

	return (
		<TweeqProvider appId="com.tweeq.example-react-vite">
			<Viewport>
				<div style={{maxWidth: '20rem', padding: '2rem'}}>
					<InputNumber value={size} min={0} max={10} onChange={setSize} />
					<InputString value={name} onChange={setName} />
				</div>
			</Viewport>
		</TweeqProvider>
	)
}

createRoot(document.getElementById('root')!).render(<ExampleApp />)
