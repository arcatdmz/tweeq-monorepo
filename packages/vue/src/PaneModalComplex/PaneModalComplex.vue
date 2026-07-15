<script setup lang="ts">
import {isMultilineEditorTarget} from '@tweeq/dom'
import {useEventListener} from '@vueuse/core'
import {onBeforeUnmount, ref} from 'vue'

import {InputButton} from '../InputButton'
import {InputComplex, type Scheme} from '../InputComplex'
import {PaneModal} from '../PaneModal'
import {useModalStore} from '../stores/modal'
import type {ShowOptions} from './types'

const modal = useModalStore()

const desc = ref<{
	value: any
	initialValue: any
	scheme: Scheme<any>
	options?: ShowOptions
} | null>(null)

const open = ref(false)

function onUpdate(value: any) {
	desc.value!.value = value
	onInput?.(value)
}

let onInput: ((value: any) => void) | undefined = undefined
let endEdit: (value: any) => void = () => {}
let pending = false

function promptImpl<T extends Record<string, unknown>>(
	value: T,
	scheme: Scheme<T>,
	options?: ShowOptions<T>
): Promise<T | null> {
	if (pending && desc.value) {
		endEdit(desc.value.initialValue)
	}

	desc.value = {scheme, value, initialValue: value, options}
	onInput = options?.onInput
	open.value = true
	pending = true

	return new Promise<T | null>(resolve => {
		endEdit = (value: any) => {
			open.value = false
			pending = false
			endEdit = () => {}
			resolve(value)
		}
	})
}

modal.registerPrompt(promptImpl)
onBeforeUnmount(() => {
	modal.registerPrompt(null)
	if (pending) endEdit(null)
})

// Cancel restores the value the modal opened with; Save keeps the edits. The
// modal can't be light-dismissed, so these buttons are the only way out.
function onCancel() {
	endEdit(desc.value!.initialValue)
}

function onConfirm() {
	endEdit(desc.value!.value)
}

// Keyboard: Esc cancels (restoring the opening value), Enter saves. The modal is
// a manual popover, so neither is handled by the platform — we wire them here.
useEventListener('keydown', (e: KeyboardEvent) => {
	if (!open.value) return

	// A nested popover (dropdown / menu) open on top of the modal owns Esc/Enter
	// first — closing/selecting there shouldn't cancel or save the whole modal.
	// The modal itself is one `:popover-open`, so anything beyond that is nested.
	if (document.querySelectorAll(':popover-open').length > 1) return

	if (e.key === 'Escape') {
		e.preventDefault()
		onCancel()
	} else if (e.key === 'Enter') {
		// Leave Enter to the field when it means a newline (textarea / code editor)
		// or while an IME composition is in flight.
		if (e.isComposing || isMultilineEditorTarget(e.target)) return
		e.preventDefault()
		onConfirm()
	}
})

defineExpose({
	prompt: promptImpl,
})
</script>

<template>
	<PaneModal v-model:open="open">
		<div
			v-if="desc"
			class="TqPaneModalComplex"
			data-tq-component="pane-modal-complex"
			data-tq-part="root"
		>
			<div class="body" data-tq-part="body">
				<InputComplex
					:title="desc.options?.title"
					:scheme="desc.scheme"
					:modelValue="desc.value"
					@update:modelValue="onUpdate"
				/>
			</div>
			<div class="footer" data-tq-part="footer">
				<InputButton subtle label="Cancel" @click="onCancel" />
				<InputButton label="Save" @click="onConfirm" />
			</div>
		</div>
	</PaneModal>
</template>
