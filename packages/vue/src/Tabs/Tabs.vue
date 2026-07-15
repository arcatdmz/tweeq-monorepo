<script setup lang="ts">
import {moveTabSelection, resolveActiveTabId} from '@tweeq/core'
import {provide, reactive, watch} from 'vue'

import {useAppConfigStore} from '../stores/appConfig'
import {AddTabKey, DeleteTabKey, TabsProviderKey, UpdateTabKey} from './symbols'
import type {Tab, TabsProps, TabsState} from './types'

const props = defineProps<TabsProps>()

const emit = defineEmits<{
	changed: [tab: Tab]
	clicked: [tab: Tab]
}>()

const state: TabsState = reactive({
	activeId: '',
	tabs: [] as Tab[],
})

provide(TabsProviderKey, state)

provide(AddTabKey, tab => {
	if (!state.tabs.some(item => item.id === tab.id)) state.tabs.push(tab)
})

provide(UpdateTabKey, (id: string, data: Tab) => {
	const tabIndex = state.tabs.findIndex(tab => tab.id === id)
	if (tabIndex < 0) return

	data.isActive = state.tabs[tabIndex].isActive
	state.tabs[tabIndex] = data
})

provide(DeleteTabKey, id => {
	const tabIndex = state.tabs.findIndex(tab => tab.id === id)

	state.tabs.splice(tabIndex, 1)
})

const appConfig = useAppConfigStore()
const activeId = appConfig.ref<null | string>(
	props.options?.storageKey ?? `${props.name}.active`,
	null
)

const selectTab = (id: string, event?: Event): void => {
	const selectedTab = findTab(id)

	if (!selectedTab) {
		return
	}

	if (selectedTab.isDisabled) {
		event?.preventDefault()
		return
	}

	if (state.activeId === selectedTab.id) {
		emit('clicked', selectedTab)
		return
	}

	state.tabs.forEach(tab => {
		tab.isActive = tab.id === selectedTab.id
	})

	emit('changed', selectedTab)

	state.activeId = selectedTab.id

	activeId.value = selectedTab.id
}

const findTab = (id: string): Tab | undefined => {
	return state.tabs.find(tab => tab.id === id)
}

function onTabKeydown(event: KeyboardEvent, id: string) {
	const next = moveTabSelection({
		tabs: state.tabs,
		currentId: id,
		key: event.key,
		vertical: Boolean(props.vertical),
	})
	if (!next) return
	event.preventDefault()
	const buttons = (event.currentTarget as HTMLElement)
		.closest('[role="tablist"]')
		?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
	const target = [...(buttons ?? [])].find(
		button => button.dataset.tqTabId === next
	)
	target?.focus()
	if (next !== state.activeId) selectTab(next)
}

// Keep exactly one valid tab active. Reactive (not a one-shot onMounted) because
// tabs register via their own onBeforeMount — which, for tabs rendered by a
// v-for, can land after this parent mounts — and the active tab can later be
// removed. A one-shot check that ran before any tab existed would leave nothing
// selected. Preference: the persisted tab, then an explicit default, then tab 0.
function ensureActiveTab() {
	if (!state.tabs.length) return
	const next = resolveActiveTabId(
		state.tabs,
		state.activeId,
		activeId.value,
		props.options?.defaultTabId
	)
	if (next && next !== state.activeId) selectTab(next)
	else if (!next && state.activeId) {
		state.activeId = ''
		state.tabs.forEach(tab => (tab.isActive = false))
	}
}

watch(
	() => state.tabs.map(tab => `${tab.id}:${tab.isDisabled}`),
	ensureActiveTab,
	{immediate: true}
)
</script>

<template>
	<div
		class="TqTabs"
		:class="{vertical}"
		data-tq-component="tabs"
		:data-tq-orientation="vertical ? 'vertical' : 'horizontal'"
		data-tq-part="root"
	>
		<div class="tablist-wrapper" data-tq-part="tablist-wrapper">
			<div
				v-if="$slots['before-tablist']"
				class="before-tablist"
				data-tq-part="before-tablist"
			>
				<slot name="before-tablist" />
			</div>
			<ul
				role="tablist"
				:aria-orientation="vertical ? 'vertical' : 'horizontal'"
				class="tablist"
				data-tq-part="tablist"
			>
				<li
					v-for="(tab, i) in state.tabs"
					:key="i"
					class="tablist-item"
					:class="{disabled: tab.isDisabled, active: tab.isActive}"
					role="presentation"
					data-tq-part="tablist-item"
					:data-tq-disabled="tab.isDisabled ? '' : undefined"
					:data-tq-active="tab.isActive ? '' : undefined"
				>
					<button
						:id="tab.tabId"
						type="button"
						class="tablist-link"
						:class="{disabled: tab.isDisabled, active: tab.isActive}"
						role="tab"
						:aria-controls="tab.paneId"
						:aria-selected="tab.isActive"
						:disabled="tab.isDisabled"
						:tabindex="tab.isActive ? 0 : -1"
						data-tq-tab=""
						:data-tq-tab-id="tab.id"
						:data-tq-part="`tab-${tab.id}`"
						@click="selectTab(tab.id, $event)"
						@keydown="onTabKeydown($event, tab.id)"
						>{{ tab.name }}</button
					>
				</li>
			</ul>
		</div>
		<div class="panels-wrapper" data-tq-part="panels-wrapper">
			<slot />
		</div>
	</div>
</template>
../stores/useAppStorage
