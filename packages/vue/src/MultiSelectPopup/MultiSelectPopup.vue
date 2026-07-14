<script setup lang="ts">
import {addAnchorName, getMultiSelectActions} from '@tweeq/dom'
import {
	computed,
	onBeforeUnmount,
	onMounted,
	useTemplateRef,
	watchEffect,
} from 'vue'

import {Icon} from '../Icon'
import {useMultiSelectStore} from '../stores/multiSelect'
import MultiSelectButton from './MultiSelectButton.vue'
import MultiSelectPad from './MultiSelectPad.vue'

const multiSelect = useMultiSelectStore()

const $root = useTemplateRef('$root')

onMounted(() => {
	if (!$root.value) return
	multiSelect.setPopupEl($root.value)
})
onBeforeUnmount(() => multiSelect.setPopupEl(null))

// Anchor the popup under the focused input via CSS Anchor Positioning (no
// floating-ui). The browser keeps it positioned on scroll/resize. anchor() is
// passed inline rather than in the stylus block, which would try to parse it as
// a stylus function call.
const ANCHOR_NAME = '--tq-multi-select-anchor'

const anchorStyle = {
	positionAnchor: ANCHOR_NAME,
	top: 'anchor(bottom)',
	right: 'anchor(right)',
}

watchEffect(onCleanup => {
	const el = multiSelect.focusedElement
	if (!el) return
	onCleanup(addAnchorName(el, ANCHOR_NAME))
})

const enabledActions = computed(() =>
	getMultiSelectActions(multiSelect.selectedInputs)
)

const visible = computed(() => {
	if (multiSelect.selectedInputs.length <= 1) return false
	if (enabledActions.value.length === 0) return false

	return true
})

watchEffect(() => {
	const root = $root.value
	if (!root) return
	try {
		if (
			visible.value &&
			typeof root.showPopover === 'function' &&
			!root.matches(':popover-open')
		) {
			root.showPopover()
		} else if (
			!visible.value &&
			typeof root.hidePopover === 'function' &&
			root.matches(':popover-open')
		) {
			root.hidePopover()
		}
	} catch {
		// Unsupported or partial native popover implementation: keep the popup
		// in normal DOM flow and let the stable visibility state provide fallback.
	}
})
</script>

<template>
	<div
		ref="$root"
		class="TqMultiSelectPopup"
		:style="anchorStyle"
		popover="manual"
		data-tq-component="multi-select-popup"
		:data-tq-visible="visible ? '' : undefined"
		data-tq-part="root"
	>
		<Icon icon="lsicon:control-filled" data-tq-part="tune-icon" />
		<div data-tq-part="actions">
			<template v-for="action in enabledActions" :key="action.icon">
				<MultiSelectPad
					v-if="action.type === 'slider' || action.type === 'pad'"
					:type="action.type"
					:updator="action.update"
					:icon="action.icon"
					:label="action.label"
				/>
				<MultiSelectButton
					v-else-if="action.type === 'button'"
					:updator="action.update"
					:icon="action.icon"
					:label="action.label"
				/>
			</template>
		</div>
	</div>
</template>
