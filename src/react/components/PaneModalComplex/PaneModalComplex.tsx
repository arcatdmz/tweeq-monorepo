import {useEffect, useRef, useState} from 'react'

import {
	type ModalScheme,
	modalStore,
	type PromptFn,
	type ShowOptions,
} from '../../../core'
import {useEventListener} from '../../hooks'
import {InputButton} from '../InputButton'
import {InputComplex, type Scheme} from '../InputComplex'
import {PaneModal} from '../PaneModal'
import styles from './PaneModalComplex.module.styl'

interface Description {
	value: Record<string, unknown>
	initialValue: Record<string, unknown>
	scheme: Scheme<Record<string, unknown>>
	options?: ShowOptions
}

interface Session {
	initialValue: Record<string, unknown>
	resolve(value: any): void
}

function isMultilineTarget(target: EventTarget | null) {
	const element = target as HTMLElement | null
	return Boolean(
		element &&
			(element.tagName === 'TEXTAREA' ||
				element.isContentEditable ||
				element.closest?.('.monaco-editor'))
	)
}

export function PaneModalComplex() {
	const [description, setDescription] = useState<Description | null>(null)
	const [open, setOpen] = useState(false)
	const descriptionRef = useRef(description)
	descriptionRef.current = description
	const openRef = useRef(open)
	openRef.current = open
	const session = useRef<Session | null>(null)
	const finish = (value: Record<string, unknown> | null) => {
		const current = session.current
		if (!current) return
		session.current = null
		setOpen(false)
		current.resolve(value)
	}

	useEffect(() => {
		const prompt: PromptFn = (value, scheme, options) => {
			if (session.current) {
				session.current.resolve(session.current.initialValue)
				session.current = null
			}
			setDescription({
				value,
				initialValue: value,
				scheme: scheme as Scheme<Record<string, unknown>>,
				options,
			})
			setOpen(true)
			return new Promise(resolve => {
				session.current = {initialValue: value, resolve}
			})
		}
		modalStore.getState().registerPrompt(prompt)
		return () => {
			modalStore.getState().registerPrompt(null)
			if (session.current) session.current.resolve(null)
		}
	}, [])

	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			if (
				!openRef.current ||
				document.querySelectorAll(':popover-open').length > 1
			)
				return
			const current = descriptionRef.current
			if (!current) return
			if (event.key === 'Escape') {
				event.preventDefault()
				finish(current.initialValue)
			} else if (
				event.key === 'Enter' &&
				!event.isComposing &&
				!isMultilineTarget(event.target)
			) {
				event.preventDefault()
				finish(current.value)
			}
		}
	)

	return (
		<PaneModal open={open}>
			{description && (
				<div className={styles.modalComplex}>
					<div className={styles.body}>
						<InputComplex
							title={description.options?.title}
							scheme={description.scheme}
							value={description.value}
							onChange={value => {
								setDescription(current =>
									current ? {...current, value} : current
								)
								description.options?.onInput?.(value)
							}}
						/>
					</div>
					<div className={styles.footer}>
						<InputButton
							subtle
							label="Cancel"
							onClick={() => finish(description.initialValue)}
						/>
						<InputButton
							label="Save"
							onClick={() => finish(description.value)}
						/>
					</div>
				</div>
			)}
		</PaneModal>
	)
}

export type {ModalScheme}
