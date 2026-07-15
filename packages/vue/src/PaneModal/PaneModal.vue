<script setup lang="ts">
import {useEventListener} from '@vueuse/core'
import {ref, useTemplateRef, watchEffect} from 'vue'

defineSlots<{
	default: void
}>()

const props = withDefaults(
	defineProps<{
		open: boolean
	}>(),
	{
		open: false,
	}
)

const $root = useTemplateRef('$root')

watchEffect(() => {
	const root = $root.value
	if (!root) return
	try {
		if (typeof root.togglePopover === 'function') root.togglePopover(props.open)
		else if (props.open && typeof root.showPopover === 'function') root.showPopover()
		else if (!props.open && typeof root.hidePopover === 'function') root.hidePopover()
	} catch {
		// Unsupported native popover renders in place.
	}
})

// The modal is `popover="manual"`, so it never light-dismisses: closing is up to
// the slotted Save/Cancel buttons. A pointerdown outside bounces the modal to
// signal that it's modal rather than silently doing nothing.
const emphasize = ref(false)

useEventListener('pointerdown', e => {
	if (!props.open) return
	const root = $root.value
	if (!root || e.composedPath().includes(root)) return

	// Restart the animation even on rapid repeated clicks.
	emphasize.value = false
	requestAnimationFrame(() => (emphasize.value = true))
})
</script>

<template>
	<div
		ref="$root"
		class="TqPaneModal"
		:class="{emphasize}"
		popover="manual"
		data-tq-component="pane-modal"
		:data-tq-emphasize="emphasize ? '' : undefined"
		data-tq-part="root"
		@animationend="emphasize = false"
	>
		<slot />
	</div>
</template>
