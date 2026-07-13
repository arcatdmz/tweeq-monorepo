<script setup lang="ts">
import {decorateActionMenuItems} from '@tweeq/dom'
import {computed, useTemplateRef} from 'vue'
import {ref} from 'vue'

import {ColorIcon} from '../ColorIcon'
import {Menu} from '../Menu'
import {Popover} from '../Popover'
import {useActionsStore} from '../stores/actions'
import type {TitleBarProps} from './types'

defineProps<TitleBarProps>()

defineSlots<{
	left(): any
	center(): any
	right(): any
}>()

const actions = useActionsStore()

const appIcon = useTemplateRef<any>('appIcon')
const appMenu = useTemplateRef<any>('appMenu')

const isMenuShown = ref(false)

// The whole bar is a drag region (-webkit-app-region: drag), and the OS
// swallows pointer events over drag regions — so clicking the bar's background
// never reaches the DOM, and neither a popover's light-dismiss nor an input's
// blur fires. While the app menu is open or something inside the bar is
// focused, turn dragging off so those background clicks register and dismiss.
const hasFocusWithin = ref(false)
const noDrag = computed(() => isMenuShown.value || hasFocusWithin.value)

const menus = computed(() => decorateActionMenuItems(actions.menu))

function onFocusOut(event: FocusEvent) {
	const root = event.currentTarget as HTMLElement
	if (!root.contains(event.relatedTarget as Node | null)) {
		hasFocusWithin.value = false
	}
}

function toggleMenu() {
	isMenuShown.value = !isMenuShown.value
}

function onIconKeydown(event: KeyboardEvent) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	toggleMenu()
}
</script>

<template>
	<div
		class="TqTitleBar"
		:class="{noDrag}"
		data-tq-component="title-bar"
		:data-tq-no-drag="noDrag ? '' : undefined"
		data-tq-part="root"
		@focusin="hasFocusWithin = true"
		@focusout="onFocusOut"
	>
		<div class="left" data-tq-part="left">
			<ColorIcon
				ref="appIcon"
				class="app-icon"
				:src="icon"
				:class="{shown: isMenuShown}"
				role="button"
				tabindex="0"
				:aria-label="`${name} menu`"
				:aria-expanded="isMenuShown"
				data-tq-part="menu-trigger"
				@click="toggleMenu"
				@keydown="onIconKeydown"
			/>
			<Popover
				:reference="appIcon"
				placement="bottom-start"
				v-model:open="isMenuShown"
			>
				<Menu
					v-if="isMenuShown"
					ref="appMenu"
					:items="menus"
					@close="isMenuShown = false"
				/>
			</Popover>
			<span class="app-name" data-tq-part="app-name">{{ name }}</span>
			<slot name="left" />
		</div>
		<div class="center" data-tq-part="center">
			<slot name="center" />
		</div>
		<div class="right" data-tq-part="right">
			<slot name="right" />
		</div>
	</div>
</template>
