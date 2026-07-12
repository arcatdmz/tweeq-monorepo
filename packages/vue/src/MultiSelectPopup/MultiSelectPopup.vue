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
	$root.value?.togglePopover(visible.value)
})
</script>

<template>
	<div
		ref="$root"
		:class="{visible}"
		class="TqMultiSelectPopup"
		:style="anchorStyle"
		popover="manual"
		data-tq-part="root"
	>
		<Icon class="tune-icon" icon="lsicon:control-filled" />
		<div class="actions" data-tq-part="actions">
			<template v-for="action in enabledActions" :key="action.icon">
				<MultiSelectPad
					v-if="action.type === 'slider' || action.type === 'pad'"
					:type="action.type"
					:updator="action.update"
					:icon="action.icon"
				/>
				<MultiSelectButton
					v-else-if="action.type === 'button'"
					:updator="action.update"
					:icon="action.icon"
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>

reset-viewport('.TqMultiSelectPopup')

.TqMultiSelectPopup
	position fixed
	inset auto
	popup-style()
	margin 3px 0
	z-index 1000
	visibility hidden
	padding 0
	border-color var(--tq-color-accent)
	box-shadow none
	overflow hidden
	hover-transition(width, height, border-radius)
	box-sizing border-box

	&:not(:hover)
		width var(--tq-icon-size)
		height var(--tq-icon-size)
		border-radius 99px

	&.visible
		visibility visible

.tune-icon
	position absolute
	top -1px
	left -1px
	width var(--tq-icon-size)
	height var(--tq-icon-size)
	scale .8
	color var(--tq-color-accent)
	opacity 1
	pointer-events none

	.TqMultiSelectPopup:hover &
		opacity 0

.actions
	display flex
	flex-direction row
	padding 2px
	gap var(--tq-gap-group)
	opacity 0

	.TqMultiSelectPopup:hover &
		opacity 1
</style>
