import {createStore, type StoreApi} from 'zustand/vanilla'

/**
 * Structural stand-in for InputComplex's framework-specific `Scheme` type.
 * The modal store only passes schemes through, so this minimal shape keeps it
 * framework-free while accepting each renderer's concrete `Scheme<T>`.
 */
export type ModalScheme<T extends Record<string, unknown>> = {
	[K in keyof T]: {type: string}
}

export interface ShowOptions<T = any> {
	readonly title?: string
	onInput?: (value: T) => void
}

/** A tab backed by an InputComplex scheme (applied live via `onInput`). */
export interface ModalFormTab<T extends Record<string, unknown> = any> {
	id: string
	title: string
	scheme: ModalScheme<T>
	value: T
	onInput?: (value: T) => void
}

/**
 * A tab rendering an arbitrary component (it owns its own state/actions).
 * `component` was a Vue `Component` in the legacy store; the React modal UI
 * narrows it to a React component type when it registers its delegate.
 */
export interface ModalComponentTab {
	id: string
	title: string
	component: unknown
	props?: Record<string, unknown>
}

export type ModalTab = ModalFormTab | ModalComponentTab

export interface TabsShowOptions {
	readonly title?: string
}

export type PromptFn = <T extends Record<string, unknown>>(
	defaultValue: T,
	scheme: ModalScheme<T>,
	options?: ShowOptions
) => Promise<T | null>

export type PromptTabsFn = (
	tabs: ModalTab[],
	options?: TabsShowOptions
) => Promise<void>

export interface ModalState {
	/** Prompt the user with an auto-generated form. Resolves with the result, or null when cancelled. */
	prompt: PromptFn
	/**
	 * A tabbed modal: each tab is either an InputComplex scheme (applied live)
	 * or an arbitrary component. Resolves when the modal is closed.
	 */
	promptTabs(tabs: ModalTab[], options?: TabsShowOptions): Promise<void>
	registerPrompt(fn: PromptFn | null): void
	registerPromptTabs(fn: PromptTabsFn | null): void
}

const NO_UI =
	'No modal UI. Wrap your app with TweeqProvider once, or use the App / Viewport layout which includes it.'

export interface ModalStore extends StoreApi<ModalState> {
	dispose(): void
}

/** Create an isolated set of modal UI delegates. */
export function createModalStore(): ModalStore {
	let delegate: PromptFn | null = null
	let tabsDelegate: PromptTabsFn | null = null
	const store = createStore<ModalState>(() => ({
		prompt: async (defaultValue, scheme, options) => {
			if (typeof window === 'undefined') {
				throw new Error('modal.prompt is only available in the browser')
			}
			const fn = delegate
			if (!fn) throw new Error(NO_UI)
			return fn(defaultValue, scheme, options)
		},
		async promptTabs(tabs, options) {
			if (typeof window === 'undefined') {
				throw new Error('modal.promptTabs is only available in the browser')
			}
			const fn = tabsDelegate
			if (!fn) throw new Error(NO_UI)
			return fn(tabs, options)
		},
		registerPrompt(fn) {
			delegate = fn
		},
		registerPromptTabs(fn) {
			tabsDelegate = fn
		},
	}))
	return Object.assign(store, {
		dispose() {
			delegate = null
			tabsDelegate = null
		},
	})
}
