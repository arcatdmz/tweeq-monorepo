import {
	isMultilineEditorTarget,
	type ModalScheme,
	type PromptFn,
	type ShowOptions,
} from '@tweeq/dom'
import {useEffect, useRef, useState} from 'react'

import {useEventListener} from '../../hooks'
import {useTweeqRuntime} from '../../runtime'
import {InputButton} from '../InputButton'
import {InputComplex, type Scheme} from '../InputComplex'
import {PaneModal} from '../PaneModal'

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

export function PaneModalComplex() {
	const {modalStore} = useTweeqRuntime()
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
	}, [modalStore])

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
				!isMultilineEditorTarget(event.target)
			) {
				event.preventDefault()
				finish(current.value)
			}
		}
	)

	return (
		<PaneModal open={open}>
			{description && (
				<div data-tq-component="pane-modal-complex" data-tq-part="root">
					<div data-tq-part="body">
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
					<div data-tq-part="footer">
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
