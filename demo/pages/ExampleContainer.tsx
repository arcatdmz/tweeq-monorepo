import {type ReactNode, useState} from 'react'

import {InputComplex, type Scheme} from '../../src/react'
import {DemoContainer} from './DemoContainer'

export interface ExampleContainerProps<T extends Record<string, unknown>> {
	initialValue: T
	scheme: Scheme<T>
	children?: (value: T) => ReactNode
	testId?: string
}

/**
 * Port of docs/.vuepress/ExampleContainer.vue: a centered 18rem sandbox with
 * a scheme-driven InputComplex, inside a DemoContainer (tweeq Viewport +
 * Full Screen). The live value stays in the DOM sr-only for tests — the
 * original page shows only the form.
 */
export function ExampleContainer<T extends Record<string, unknown>>({
	initialValue,
	scheme,
	children,
	testId,
}: ExampleContainerProps<T>) {
	const [value, setValue] = useState(initialValue)

	return (
		<DemoContainer className="ExampleContainer">
			{({isFullscreen}) => (
				<>
					<div
						className={'sandbox' + (isFullscreen ? ' fullscreen' : '')}
						data-testid={testId}
					>
						<InputComplex value={value} scheme={scheme} onChange={setValue} />
						{children?.(value)}
					</div>
					<output
						className="sr-only"
						data-testid={testId ? `${testId}-value` : undefined}
					>
						{JSON.stringify(value)}
					</output>
				</>
			)}
		</DemoContainer>
	)
}
