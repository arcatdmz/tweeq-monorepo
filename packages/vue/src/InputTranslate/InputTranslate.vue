<script setup lang="ts">
import {
	decomposeVec2,
	getTranslateOverlayGeometry,
	precisionOf,
} from '@tweeq/core'
import {useMagicKeys, useRafFn} from '@vueuse/core'
import {scalar, vec2} from 'linearly'
import {computed, ref, useTemplateRef} from 'vue'

import {Icon} from '../Icon'
import {InputPositionProps} from '../InputPosition'
import {Tooltip} from '../Tooltip'
import {InputEmits} from '../types'
import {useDrag} from '../use/useDrag'

const model = defineModel<vec2>({required: true})

const props = withDefaults(
	defineProps<InputPositionProps & {showOverlayLabel?: boolean}>(),
	{
		showOverlayLabel: true,
	}
)
const emit = defineEmits<InputEmits>()

const $button = useTemplateRef('$button')

const {shift, alt, x, y} = useMagicKeys()

const min = computed(() => decomposeVec2(props.min))
const max = computed(() => decomposeVec2(props.max))

const speed = computed(() => {
	if (shift.value) return 5
	if (alt.value) return 0.1
	return 1
})

const gridScale = computed(() => {
	if (shift.value) return 0.5
	if (alt.value) return 4
	return 2
})

const gridScaleAnimated = ref(1)
useRafFn(() => {
	gridScaleAnimated.value = scalar.lerp(
		gridScaleAnimated.value,
		gridScale.value,
		0.4
	)
})

const precision = computed(() => {
	return precisionOf(speed.value)
})

const overlayLabelValues = computed(() => {
	const xd = model.value[0].toFixed(precision.value)
	const yd = model.value[1].toFixed(precision.value)

	return [xd, yd]
})

const {dragging: tweaking} = useDrag($button, {
	disabled: computed(() => props.disabled),
	lockPointer: true,
	dragDelaySeconds: 0,
	onDragStart() {
		emit('focus')
	},
	onDrag({delta}) {
		const modelDelta = vec2.scale(delta, speed.value) as vec2.Mutable

		if (x.value) {
			modelDelta[1] = 0
		}

		if (y.value) {
			modelDelta[0] = 0
		}

		model.value = vec2.clamp(
			vec2.add(model.value, modelDelta),
			min.value ?? [-Infinity, -Infinity],
			max.value ?? [Infinity, Infinity]
		)
	},
	onDragEnd() {
		emit('confirm')
		emit('blur')
	},
})

const geometry = computed(() =>
	getTranslateOverlayGeometry({
		value: model.value,
		min: min.value,
		max: max.value,
		scale: gridScaleAnimated.value,
	})
)
</script>

<template>
	<button
		ref="$button"
		class="TqInputTranslate"
		type="button"
		:disabled="props.disabled"
		:aria-invalid="props.invalid || undefined"
		:inline-position="props.inlinePosition"
		:block-position="props.blockPosition"
		data-tq-component="input-translate"
		data-tq-part="root"
	>
		<Icon
			class="grid-icon"
			icon="mingcute:dot-grid-fill"
			data-tq-part="icon"
		/>
		<Transition
			enter-from-class="tq-input-translate-overlay-hidden"
			leave-to-class="tq-input-translate-overlay-hidden"
		>
			<div v-if="tweaking" class="overlay" data-tq-part="overlay">
				<div
					class="overlay-grid"
					:style="geometry.grid"
					data-tq-part="overlay-grid"
				>
					<div v-if="x" data-tq-part="axis" data-tq-axis="x" />
					<div v-if="y" data-tq-part="axis" data-tq-axis="y" />
					<div
						class="zero"
						:style="geometry.zero"
						data-tq-part="zero"
					/>
				</div>
				<Tooltip
					v-if="showOverlayLabel"
					data-tq-part="overlay-label"
				>
					<label>X</label>
					{{ overlayLabelValues[0] }}
					<label>Y</label>
					{{ overlayLabelValues[1] }}
				</Tooltip>
			</div>
		</Transition>
	</button>
</template>
