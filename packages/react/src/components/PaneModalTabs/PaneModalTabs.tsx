import {
	isMultilineEditorTarget,
	type ModalComponentTab as CoreComponentTab,
	type ModalFormTab as CoreFormTab,
	modalStore,
	type ModalTab as CoreModalTab,
	type PromptTabsFn,
	type TabsShowOptions,
} from '@tweeq/dom'
import {
	type ComponentType,
	createElement,
	useEffect,
	useRef,
	useState,
} from 'react'

import {useEventListener} from '../../hooks'
import {InputButton} from '../InputButton'
import {InputComplex, type Scheme} from '../InputComplex'
import {PaneModal} from '../PaneModal'
import {Tab, Tabs} from '../Tabs'
import styles from './PaneModalTabs.module.styl'

export interface PaneModalFormTab<
	T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<CoreFormTab<T>, 'scheme'> {
	scheme: Scheme<T>
}

export interface PaneModalComponentTab
	extends Omit<CoreComponentTab, 'component'> {
	component: ComponentType<any>
}

export type PaneModalTab = PaneModalFormTab | PaneModalComponentTab
export type {TabsShowOptions}

export function PaneModalTabs() {
	const [description, setDescription] = useState<{
		tabs: PaneModalTab[]
		options?: TabsShowOptions
	} | null>(null)
	const [values, setValues] = useState<Record<string, Record<string, unknown>>>(
		{}
	)
	const [open, setOpen] = useState(false)
	const openRef = useRef(open)
	openRef.current = open
	const descriptionRef = useRef(description)
	descriptionRef.current = description
	const resolveRef = useRef<(() => void) | null>(null)
	const finish = () => {
		setOpen(false)
		resolveRef.current?.()
		resolveRef.current = null
	}

	useEffect(() => {
		const promptTabs: PromptTabsFn = (tabs: CoreModalTab[], options) => {
			resolveRef.current?.()
			const reactTabs = tabs as PaneModalTab[]
			setDescription({tabs: reactTabs, options})
			setValues(
				Object.fromEntries(
					reactTabs
						.filter((tab): tab is PaneModalFormTab => 'scheme' in tab)
						.map(tab => [tab.id, {...tab.value}])
				)
			)
			setOpen(true)
			return new Promise<void>(resolve => {
				resolveRef.current = resolve
			})
		}
		modalStore.getState().registerPromptTabs(promptTabs)
		return () => {
			modalStore.getState().registerPromptTabs(null)
			resolveRef.current?.()
		}
	}, [])

	const cancel = () => {
		for (const tab of descriptionRef.current?.tabs ?? []) {
			if ('scheme' in tab) tab.onInput?.(tab.value)
		}
		finish()
	}
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			if (
				!openRef.current ||
				document.querySelectorAll(':popover-open').length > 1
			)
				return
			if (event.key === 'Escape') {
				event.preventDefault()
				cancel()
			} else if (
				event.key === 'Enter' &&
				!event.isComposing &&
				!isMultilineEditorTarget(event.target)
			) {
				event.preventDefault()
				finish()
			}
		}
	)

	return (
		<PaneModal open={open}>
			{description && (
				<div className={styles.modalTabs}>
					{description.options?.title && (
						<div className={styles.title}>{description.options.title}</div>
					)}
					<Tabs
						name={`modal-${description.options?.title ?? 'tabs'}`}
						vertical
						className={styles.body}
					>
						{description.tabs.map(tab => (
							<Tab key={tab.id} id={tab.id} name={tab.title}>
								{'scheme' in tab ? (
									<InputComplex
										scheme={tab.scheme as Scheme<Record<string, unknown>>}
										value={values[tab.id] ?? tab.value}
										onChange={value => {
											setValues(current => ({...current, [tab.id]: value}))
											tab.onInput?.(value)
										}}
									/>
								) : (
									createElement(tab.component, tab.props)
								)}
							</Tab>
						))}
					</Tabs>
					<div className={styles.footer}>
						<InputButton subtle label="Cancel" onClick={cancel} />
						<InputButton label="Done" onClick={finish} />
					</div>
				</div>
			)}
		</PaneModal>
	)
}
