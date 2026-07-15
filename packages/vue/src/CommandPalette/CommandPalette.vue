<script setup lang="ts">
import {
	moveCommandSelection,
	updateCommandHistory,
} from '@tweeq/core'
import {useEventListener} from '@vueuse/core'
import {search} from 'fast-fuzzy'
import {computed, onMounted, ref, useTemplateRef, watch} from 'vue'

import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'
import {type ActionItemOptions, useActionsStore} from '../stores/actions'
import {useAppConfigStore} from '../stores/appConfig'

const actions = useActionsStore()

const $popover = useTemplateRef('$popover')
const searchWord = ref('')

const appConfig = useAppConfigStore()

const performedActionsHistory = appConfig.ref<string[]>(
	'commandPalette.performedActionsHistory',
	[]
)

const open = ref(false)
const nativePopover = ref<boolean | null>(null)
const ACTION_LIST_ID = 'tq-command-palette-actions'

function actionDomId(id: string) {
	return `tq-command-palette-action-${encodeURIComponent(id)}`
}

onMounted(() => {
	const popover = $popover.value
	nativePopover.value =
		typeof popover?.togglePopover === 'function' &&
		typeof popover.hidePopover === 'function'
})

useEventListener($popover, 'toggle', (e: ToggleEvent) => {
	open.value = e.newState === 'open'
})

watch(
	open,
	open => {
		searchWord.value = ''
		if (open) {
			$popover.value?.querySelector('input')?.focus()
		}
	},
	{immediate: true}
)

const filteredActions = computed(() => {
	if (searchWord.value === '' && open.value) {
		return performedActionsHistory.value
			.map(id => actions.allActions[id])
			.filter(action => action !== undefined)
	}

	return search(searchWord.value, Object.values(actions.allActions), {
		keySelector: action => action.label,
	})
})

const selectedAction = ref<null | ActionItemOptions>(null)

watch(filteredActions, () => {
	if (filteredActions.value.length > 0) {
		selectedAction.value = filteredActions.value[0]
	} else {
		selectedAction.value = null
	}
})

useEventListener(typeof window === 'undefined' ? null : window, 'keydown', event => {
	const e = event as KeyboardEvent
	if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'p') return
	e.preventDefault()
	const popover = $popover.value
	if (typeof popover?.togglePopover !== 'function') {
		open.value = !open.value
		return
	}
	try {
		popover.togglePopover()
	} catch {
		nativePopover.value = false
		open.value = !open.value
	}
})

function onKeydown(e: KeyboardEvent) {
	if (selectedAction.value && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
		e.preventDefault()
		const index = filteredActions.value.indexOf(selectedAction.value as any)
		const length = filteredActions.value.length

		const move = e.key === 'ArrowDown' ? 1 : -1

		const newIndex = moveCommandSelection(index, move, length)
		selectedAction.value = filteredActions.value[newIndex]
	}

	if (e.key === 'Enter' && selectedAction.value) {
		perform(selectedAction.value as ActionItemOptions)
	}
}

function perform(action: ActionItemOptions) {
	performedActionsHistory.value = updateCommandHistory(
		performedActionsHistory.value,
		action.id
	)

	const popover = $popover.value
	if (typeof popover?.hidePopover === 'function') {
		try {
			popover.hidePopover()
		} catch {
			nativePopover.value = false
			open.value = false
		}
	} else {
		open.value = false
	}
	void actions.perform(action.id)
}
</script>

<template>
	<div
		ref="$popover"
		class="TqCommandPalette"
		popover
		data-tq-component="command-palette"
		:data-tq-open="open ? '' : undefined"
		:data-tq-popover-fallback="nativePopover === false ? '' : undefined"
		data-tq-part="root"
	>
		<div data-tq-part="search-container">
			<Icon icon="material-symbols:search-rounded" data-tq-part="search-icon" />
			<input
				v-model="searchWord"
				type="text"
				placeholder="Search menus and commands"
				role="combobox"
				aria-autocomplete="list"
				:aria-controls="ACTION_LIST_ID"
				:aria-expanded="open"
				:aria-activedescendant="
					selectedAction ? actionDomId(selectedAction.id) : undefined
				"
				data-tq-part="search"
				@keydown="onKeydown"
			/>
		</div>
		<div
			v-if="searchWord === '' && filteredActions.length > 0"
			data-tq-part="recent-actions"
		>
			Recent Actions
		</div>
		<ul :id="ACTION_LIST_ID" role="listbox" data-tq-part="action-list">
			<li
				v-for="action in filteredActions"
				:key="action.id"
				:id="actionDomId(action.id)"
				role="option"
				:aria-selected="action === selectedAction"
				:data-tq-selected="action === selectedAction ? '' : undefined"
				data-tq-part="action"
				@pointermove="selectedAction = action"
				@click="perform(action)"
			>
				<Icon
					:icon="action.icon ?? ''"
					data-tq-part="action-icon"
				/>
				<span data-tq-part="action-label">{{ action.label }}</span>
				<BindIcon
					v-if="action.bind?.icon"
					:icon="action.bind.icon"
					data-tq-part="action-bind-icon"
				/>
			</li>
		</ul>
	</div>
</template>
