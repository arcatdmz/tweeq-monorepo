import {Icon, InputComplex, type Scheme, useKeys} from '@tweeq/react'
import {type ReactNode, useState} from 'react'

import {DemoContainer} from './DemoContainer'

export interface DemoListeners {
	update: (value: unknown, ...args: unknown[]) => void
	focus: (...args: unknown[]) => void
	blur: (...args: unknown[]) => void
	confirm: (...args: unknown[]) => void
}

export interface DemoComponentProps<
	V,
	T extends Record<string, unknown>,
> {
	name: string
	initialValue?: V
	scheme: Scheme<T>
	options: T
	children: (props: {
		modelValue: V
		options: T
		listeners: DemoListeners
	}) => ReactNode
}

const MODIFIER_KEYS = ['Meta', 'Shift', 'Alt', 'Control', 'q', 'a', 'r'] as const

function PressedKeys() {
	const keys = useKeys(MODIFIER_KEYS)
	const pressed = MODIFIER_KEYS.filter(key => keys[key])
	if (!pressed.length) return null
	return (
		<div className="pressed-keys">
			{pressed.map(key => (
				<div key={key}>
					{key === 'Meta' ? (
						<Icon icon="material-symbols:keyboard-command-key" />
					) : key === 'Shift' ? (
						<Icon icon="material-symbols:shift-outline" />
					) : key === 'Alt' ? (
						<Icon icon="material-symbols:keyboard-option-key" />
					) : (
						<span>{key.toUpperCase()}</span>
					)}
				</div>
			))}
		</div>
	)
}

/**
 * Port of docs/.vuepress/DemoComponent.vue: the per-component demo on the
 * Components page. Left: the component sandbox (Full Screen capable, with a
 * pressed-keys display while fullscreen). Right: an InputComplex editing the
 * component's props live. Event listeners log to the console like the
 * original, so behaviors can be inspected.
 */
export function DemoComponent<V, T extends Record<string, unknown>>({
	name,
	initialValue,
	scheme,
	options: initialOptions,
	children,
}: DemoComponentProps<V, T>) {
	const [modelValue, setModelValue] = useState(initialValue as V)
	const [options, setOptions] = useState(initialOptions)

	const listeners: DemoListeners = {
		update: (value, ...args) => {
			// eslint-disable-next-line no-console
			console.info(`[${name}] update\t`, value, ...args)
			setModelValue(value as V)
		},
		// eslint-disable-next-line no-console
		focus: (...args) => console.info(`[${name}] focus\t`, ...args),
		// eslint-disable-next-line no-console
		blur: (...args) => console.info(`[${name}] blur\t`, ...args),
		// eslint-disable-next-line no-console
		confirm: (...args) => console.info(`[${name}] confirm\t`, ...args),
	}

	return (
		<DemoContainer className="DemoComponent">
			{({isFullscreen}) => (
				<>
					<div
						className={'input-wrapper' + (isFullscreen ? ' fullscreen' : '')}
					>
						<div className="input">
							{children({modelValue, options, listeners})}
						</div>
						{isFullscreen && <PressedKeys />}
					</div>
					{!isFullscreen && (
						<div className="options">
							{Object.keys(scheme).length > 0 && (
								<InputComplex
									value={options}
									scheme={scheme}
									onChange={setOptions}
								/>
							)}
						</div>
					)}
				</>
			)}
		</DemoContainer>
	)
}
