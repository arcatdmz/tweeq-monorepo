<script setup lang="ts">
import {
	isPointInTriangle,
	type MenuItem,
	type Point,
} from '@tweeq/core'
import {computed, ref, useTemplateRef} from 'vue'

import {BindIcon} from '../BindIcon'
import {Icon} from '../Icon'
import Popover from '../Popover/Popover.vue'
import {useThemeStore} from '../stores/theme'

export interface Props {
	items: MenuItem[]
}

const props = defineProps<Props>()

// Bubbles up when a command is chosen, so the whole menu chain can close (this
// replaces floating-vue's v-close-popper.all now that menus use Tweeq Popover).
const emit = defineEmits<{close: []}>()

function onClick(menu: MenuItem) {
	if ('perform' in menu && menu.perform) {
		menu.perform()
		emit('close')
	}
}

const theme = useThemeStore()

const hoverIndex = ref(-1)

const $menuRoot = useTemplateRef<HTMLElement>('$menuRoot')
const $lists = useTemplateRef<HTMLElement[]>('$lists')
const $childMenu = useTemplateRef<{getRoot: () => HTMLElement | null}>(
	'$childMenu'
)

// Expose the root <ul> so a parent menu can measure this submenu for its safe
// triangle (the component is multi-root, so $el isn't reliably the <ul>).
defineExpose({getRoot: () => $menuRoot.value})

const $childReference = computed<HTMLElement | null>(() => {
	if (hoverIndex.value === -1) return null

	return $lists.value?.[hoverIndex.value] ?? null
})

const childItems = computed(() => {
	const item = props.items[hoverIndex.value]
	return item && 'children' in item ? (item.children ?? null) : null
})

// --- "Safe triangle" submenu navigation ---------------------------------------
// While a submenu is open, let the cursor cut diagonally across sibling items to
// reach it without the submenu closing. Each move we test whether the cursor is
// travelling *into* the submenu: it's inside the triangle (beam) fanned from the
// previous cursor position to the submenu's near edge. While so, sibling hovers
// are ignored; the moment the cursor leaves that beam, the hovered sibling wins.
let pointer: Point = {x: 0, y: 0}
let prevPointer: Point = {x: 0, y: 0}
// Item currently under the cursor (may differ from hoverIndex while in the beam).
const candidateIndex = ref(-1)

function submenuIsOpen() {
	const cur = props.items[hoverIndex.value]
	return hoverIndex.value !== -1 && !!cur && 'children' in cur && !!cur.children
}

// The submenu's vertical edge facing the cursor (handles a left-flipped submenu).
function submenuEdge(): {c1: Point; c2: Point} | null {
	const el = $childMenu.value?.getRoot()
	if (!el) return null
	const r = el.getBoundingClientRect()
	const edgeX = r.left >= pointer.x ? r.left : r.right
	return {c1: {x: edgeX, y: r.top}, c2: {x: edgeX, y: r.bottom}}
}

// Is the cursor travelling toward the submenu — i.e. inside the beam fanned from
// the previous cursor position to the submenu's near edge?
function headingToSubmenu(at: Point): boolean {
	const e = submenuEdge()
	return !!e && isPointInTriangle(at, prevPointer, e.c1, e.c2)
}

function commitHover(index: number) {
	hoverIndex.value = index
}

function onItemEnter(index: number, e: PointerEvent) {
	candidateIndex.value = index
	pointer = {x: e.clientX, y: e.clientY}
	if (!submenuIsOpen() || !headingToSubmenu(pointer)) commitHover(index)
}

function onPointerMove(e: PointerEvent) {
	pointer = {x: e.clientX, y: e.clientY}

	// Left the beam toward the submenu → let the item the cursor is actually over
	// take over.
	if (
		submenuIsOpen() &&
		!headingToSubmenu(pointer) &&
		candidateIndex.value !== -1 &&
		candidateIndex.value !== hoverIndex.value
	) {
		commitHover(candidateIndex.value)
	}

	prevPointer = pointer
}

function onPointerLeave() {
	candidateIndex.value = -1
}

</script>

<template>
	<ul
		ref="$menuRoot"
		class="TqMenu"
		data-tq-component="menu"
		@pointermove="onPointerMove"
		@pointerleave="onPointerLeave"
		data-tq-part="root"
	>
		<template v-for="(menu, index) in items" :key="index + '_item'">
			<li
				v-if="'separator' in menu"
				ref="$lists"
				class="separator"
				data-tq-part="separator"
			/>
			<li
				v-else
				ref="$lists"
				class="menu"
				:class="{
					active: index === hoverIndex && candidateIndex === index,
					'submenu-open':
						index === hoverIndex &&
						candidateIndex !== index &&
						'children' in menu,
				}"
				:data-tq-active="
					index === hoverIndex && candidateIndex === index ? '' : undefined
				"
				:data-tq-submenu-open="
					index === hoverIndex &&
					candidateIndex !== index &&
					'children' in menu
						? ''
						: undefined
				"
				@click="onClick(menu)"
				@pointerenter="onItemEnter(index, $event)"
				data-tq-part="item"
			>
				<Icon
					v-if="menu.icon"
					class="icon"
					data-tq-part="icon"
					:icon="menu.icon"
				/>
				<span v-else />
				<div class="label-container" data-tq-part="label-container">
					<span class="label" data-tq-part="label">
						{{ menu.shortLabel ?? menu.label }}
					</span>
					<BindIcon
						v-if="'bindIcon' in menu && menu.bindIcon"
						class="bind-icon"
						data-tq-part="bind-icon"
						:icon="menu.bindIcon"
					/>
					<Icon
						v-if="'children' in menu"
						class="group-chevron"
						data-tq-part="group-chevron"
						icon="mdi:chevron-right"
					/>
				</div>
			</li>
		</template>
	</ul>
	<Popover
		v-if="$childReference && childItems"
		:reference="$childReference"
		placement="right-start"
		:open="true"
		:offset="{crossAxis: -theme.popupPadding}"
		:lightDismiss="false"
	>
		<Menu ref="$childMenu" :items="childItems" @close="emit('close')" />
	</Popover>
</template>
