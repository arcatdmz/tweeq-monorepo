import {createContext} from 'react'

export interface TabRegistration {
	id: string
	name: string
	isDisabled: boolean
	paneId: string
}

export interface TabsContextValue {
	activeId: string
	register(tab: TabRegistration): () => void
	update(tab: TabRegistration): void
}

export const TabsContext = createContext<TabsContextValue | null>(null)
