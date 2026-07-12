import {
	createContext,
	type PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from 'react'

import {type ColorSpace, PALETTE} from '../../../core'

export const DEFAULT_COLOR_PRESETS = Object.values(PALETTE)

interface InputColorContextValue {
	presets: readonly string[]
	colorSpace: ColorSpace
	setColorSpace(value: ColorSpace): void
}

const InputColorContext = createContext<InputColorContextValue | undefined>(
	undefined
)

export interface InputColorProviderProps extends PropsWithChildren {
	presets?: readonly string[]
}

export function InputColorProvider({
	presets = DEFAULT_COLOR_PRESETS,
	children,
}: InputColorProviderProps) {
	const [colorSpace, setColorSpace] = useState<ColorSpace>('hsv')
	const value = useMemo(
		() => ({presets: [...presets], colorSpace, setColorSpace}),
		[colorSpace, presets]
	)
	return (
		<InputColorContext.Provider value={value}>
			{children}
		</InputColorContext.Provider>
	)
}

export function useInputColorContext(): InputColorContextValue {
	const context = useContext(InputColorContext)
	if (context) return context
	return {
		presets: DEFAULT_COLOR_PRESETS,
		colorSpace: 'hsv',
		setColorSpace: () => {},
	}
}
