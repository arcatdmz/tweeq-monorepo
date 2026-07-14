<script setup lang="ts">
import {
	moveMultiSelectAction,
	type MultiSelectKeyboardValue,
} from '@tweeq/dom'
import {useMagicKeys} from '@vueuse/core'
import {vec2} from 'linearly'
import {computed, ref, useTemplateRef, watch} from 'vue'

import {IconIndicator} from '../IconIndicator'
import {useMultiSelectStore} from '../stores/multiSelect'
import {useDrag} from '../use/useDrag'

const props = defineProps<{
	type: 'slider' | 'pad'
	updator:
		| ((delta: number) => (values: number[]) => number[])
		| ((delta: vec2) => (values: number[]) => number[])
	icon: string
	label: string
}>()

const multiSelect = useMultiSelectStore()

const $root = useTemplateRef('$root')

let origin: vec2 = vec2.zero
const keyboardValue = ref<MultiSelectKeyboardValue>(
	props.type === 'slider' ? 0 : [0, 0]
)
let keyboardEditing = false

function resetKeyboardValue() {
	keyboardValue.value = props.type === 'slider' ? 0 : [0, 0]
}

function finishKeyboardEdit() {
	if (!keyboardEditing) return
	multiSelect.confirmValues()
	keyboardEditing = false
}

function rollbackKeyboardEdit() {
	if (!keyboardEditing) return
	const zero: MultiSelectKeyboardValue = props.type === 'slider' ? 0 : [0, 0]
	multiSelect.updateValues(props.updator(zero as any))
	finishKeyboardEdit()
	resetKeyboardValue()
}

function onFocus() {
	resetKeyboardValue()
	multiSelect.captureValues()
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape' && keyboardEditing) {
		event.preventDefault()
		rollbackKeyboardEdit()
		return
	}
	const next = moveMultiSelectAction({
		type: props.type,
		value: keyboardValue.value,
		key: event.key,
		shiftKey: event.shiftKey,
		altKey: event.altKey,
	})
	if (next === undefined) return
	event.preventDefault()
	if (!keyboardEditing) {
		multiSelect.captureValues()
		keyboardEditing = true
	}
	keyboardValue.value = next
	multiSelect.updateValues(props.updator(next as any))
}

const keyboardDescription = computed(() => {
	if (props.type === 'slider') {
		return 'Use Left or Down to decrease and Right or Up to increase. Home and End set the relative range limits. Shift changes by 10; Alt changes by 0.1.'
	}
	const [x, y] = keyboardValue.value as readonly [number, number]
	return `Use Left and Right to adjust the first selected value, and Up and Down to adjust the second. Shift changes by 10; Alt changes by 0.1. Current relative adjustments: first ${x}, second ${-y}.`
})

const {x, y, '1': d1, '2': d2} = useMagicKeys()

const constrainsX = computed(() => x.value || d1.value)
const constrainsY = computed(() => y.value || d2.value)

watch(
	[constrainsX, constrainsY],
	([x, y]) => {
		if (x || y) {
			multiSelect.captureValues()
			origin = xy.value
		}
	},
	{flush: 'sync'}
)

const {xy, dragging} = useDrag($root, {
	lockPointer: true,
	onDragStart({xy}) {
		finishKeyboardEdit()
		resetKeyboardValue()
		multiSelect.captureValues()
		origin = xy
	},
	onDrag({xy}) {
		let delta = vec2.sub(xy, origin)
		if (props.type === 'slider') {
			const f = props.updator(delta[0] as any)
			multiSelect.updateValues(f)
		} else {
			if (constrainsX.value) {
				delta = vec2.mul(delta, [1, 0])
			} else if (constrainsY.value) {
				delta = vec2.mul(delta, [0, 1])
			}

			const f = props.updator(delta as any)
			multiSelect.updateValues(f)
		}
	},
	onDragEnd() {
		multiSelect.confirmValues()
	},
})
</script>

<template>
	<div
		ref="$root"
		class="TqMultiSelectPad"
		:role="type === 'slider' ? 'slider' : 'application'"
		:aria-roledescription="type === 'pad' ? 'two-axis relative adjustment' : undefined"
		:aria-label="label"
		:aria-description="keyboardDescription"
		:aria-orientation="type === 'slider' ? 'horizontal' : undefined"
		:aria-valuemin="type === 'slider' ? -100 : undefined"
		:aria-valuemax="type === 'slider' ? 100 : undefined"
		:aria-valuenow="type === 'slider' ? (keyboardValue as number) : undefined"
		:aria-valuetext="type === 'slider' ? `Relative adjustment ${keyboardValue}` : undefined"
		aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End PageUp PageDown"
		tabindex="0"
		:data-tq-multi-select-action="type"
		:data-tq-dragging="dragging ? '' : undefined"
		data-tq-part="pad"
		@focus="onFocus"
		@blur="finishKeyboardEdit"
		@keydown="onKeydown"
	>
		<IconIndicator :icon="icon" :active="dragging" :interactive="false" />
	</div>
</template>
