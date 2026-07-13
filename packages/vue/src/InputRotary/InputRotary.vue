<script lang="ts" setup>
import {
	clampPosWithinRect,
	getRotaryDragValue,
	mergeSvgPaths,
	type Rect,
	signedAngleBetween,
	svgArc,
	svgCircle,
	svgLine,
	unsignedMod,
} from '@tweeq/core'
import {useFocus, useMagicKeys, useWindowSize} from '@vueuse/core'
import {scalar, vec2} from 'linearly'
import {range} from 'lodash-es'
import {computed, ref, useId, useTemplateRef, watch} from 'vue'

import {useMultiSelectStore} from '../stores/multiSelect'
import {useThemeStore} from '../stores/theme'
import {SvgIcon} from '../SvgIcon'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'
import type {InputEmits} from '../types'
import {useLastActive} from '../use/use'
import {useCopyPaste} from '../use/useCopyPaste'
import {useCursorStyle} from '../use/useCursorStyle'
import {useDrag} from '../use/useDrag'
import {useElementCenter} from '../use/useElementCenter'
import type {InputRotaryProps} from './types'

const props = withDefaults(defineProps<InputRotaryProps>(), {
	snap: 45,
	angleOffset: -90,
})

const theme = useThemeStore()

const model = defineModel<number>({required: true})

const emit = defineEmits<InputEmits>()

const display = computed(() => {
	const revs = Math.trunc(model.value / 360)
	const rot = model.value - revs * 360

	return (revs !== 0 ? revs + 'x ' : '') + rot.toFixed(1) + '°'
})

const initialValueOnTweak = ref(model.value)
// Continuously accumulated pre-quantization value.
const local = ref(model.value)

const snapMeterRadii: vec2 = [theme.inputHeight * 4, 160]

const $root = useTemplateRef('$root')
const center = useElementCenter($root)

const {
	dragging: tweaking,
	initial,
	origin,
	xy,
} = useDrag($root, {
	disabled: computed(() => props.disabled),
	dragDelaySeconds: 0,
	onDragStart({xy}) {
		initialValueOnTweak.value = local.value = model.value

		if (tweakMode.value === 'absolute') {
			const p = vec2.sub(xy, center.value)
			const angle = vec2.angle(p) - props.angleOffset
			const diff = signedAngleBetween(angle, local.value)

			local.value += diff
		}

		multi.capture()
	},
	onDrag({xy, previous}) {
		const p = vec2.sub(xy, center.value)
		const pp = vec2.sub(previous, center.value)

		const delta = vec2.angle(pp, p)
		const next = getRotaryDragValue(
			local.value,
			delta,
			props.snap,
			doSnap.value
		)
		local.value = next.local
		model.value = next.output

		if (tweakMode.value === 'absolute') {
			multi.update(() => next.output)
		} else {
			const relativeDelta = next.output - initialValueOnTweak.value
			multi.update(x => {
				const value = x + relativeDelta
				return doSnap.value ? scalar.quantize(value, props.snap) : value
			})
		}
	},
	onDragEnd() {
		emit('confirm')
		multi.confirm()
	},
})

const {shift, q, a: absoluteModeKey, r: relativeModeKey} = useMagicKeys()
const doSnapKey = computed(() => shift.value || q.value)

const doSnap = computed(() => {
	const radius = vec2.dist(center.value, xy.value)
	return (
		doSnapKey.value ||
		(snapMeterRadii[0] <= radius && radius <= snapMeterRadii[1])
	)
})

const tweakModeByPointer = ref<'absolute' | 'relative'>('relative')

const tweakModeByKey = useLastActive({
	absolute: absoluteModeKey,
	relative: relativeModeKey,
})

const tweakMode = computed(
	() => tweakModeByKey.value ?? tweakModeByPointer.value
)

watch(
	() => model.value,
	value => {
		if (!tweaking.value) local.value = value
	},
	{flush: 'sync'}
)

useCursorStyle(() => (tweaking.value ? 'none' : null))

const rotaryStyles = computed(() => {
	const rotation = model.value + props.angleOffset
	return {
		transformOrigin: '16px 16px',
		transform: `rotate(${rotation}deg)`,
	}
})

const windowSize = useWindowSize()

const overlayBounds = computed<Rect>(() => {
	const margin = 40
	const left = margin,
		top = margin,
		right = windowSize.width.value - margin,
		bottom = windowSize.height.value - margin

	return [
		[left, top],
		[right, bottom],
	]
})

const overlayLabelPos = computed(() => {
	return clampPosWithinRect(initial.value, xy.value, overlayBounds.value)
})

const overlayArrowStyles = computed(() => {
	const p = vec2.sub(xy.value, origin.value)
	const angle = vec2.angle(p) + 90

	return {
		transform: `rotate(${angle}deg)`,
	}
})

function radialLine(angle: number, innerRadius: number, outerRadius: number) {
	const a = angle + props.angleOffset
	return svgLine(
		vec2.dir(a, innerRadius, center.value),
		vec2.dir(a, outerRadius, center.value)
	)
}

const metersPath = computed(() =>
	mergeSvgPaths(
		range(0, 360, props.snap).map(a => radialLine(a, ...snapMeterRadii))
	)
)

const activeMeterPath = computed(() => {
	return doSnap.value && model.value % props.snap === 0
		? radialLine(model.value, ...snapMeterRadii)
		: ''
})

const overlayPath = computed(() => {
	const c = center.value

	if (tweakMode.value === 'absolute') {
		const dist = vec2.distance(center.value, xy.value)
		const angle = model.value

		const innerRadius = theme.inputHeight
		const outerRadius = dist

		return radialLine(angle, innerRadius, outerRadius)
	} else {
		const baseRadius = theme.inputHeight * 4
		const radiusStep = theme.inputHeight * 0.25

		const start = initialValueOnTweak.value + props.angleOffset
		const end = model.value + props.angleOffset

		const turns =
			Math.floor(Math.abs(end - start) / 360) * Math.sign(end - start)

		// Create revolutions
		const revolutions = range(0, turns).map(i =>
			svgCircle(c, baseRadius + i * radiusStep)
		)

		// Create arc
		const arcRadius = baseRadius + turns * radiusStep

		let offsetInTurn = unsignedMod(signedAngleBetween(end, start), 360)
		if (end < start) {
			offsetInTurn -= 360
		}

		const startInTurn = unsignedMod(start, 360)
		const endInTurn = startInTurn + offsetInTurn

		const arc = svgArc(c, arcRadius, startInTurn, endInTurn)

		return mergeSvgPaths([...revolutions, arc])
	}
})

//------------------------------------------------------------------------------
// Multi Select

const multi = useMultiSelectStore().register({
	type: 'number',
	el: $root,
	focusing: useFocus($root).focused,
	getValue: () => local.value,
	setValue(value) {
		local.value = value
		model.value = value
	},
	confirm() {
		emit('confirm')
	},
})

//------------------------------------------------------------------------------
// Copy and paste

useCopyPaste({
	target: $root,
	onCopy() {
		navigator.clipboard.writeText(model.value.toString())
	},
	onPaste: async () => {
		const text = await navigator.clipboard.readText()
		if (!text) return

		const value = parseFloat(text)

		if (isNaN(value)) return

		model.value = value

		multi.update(() => value)
		multi.confirm()
	},
})

const markerId = `tq-rotary-${useId().replaceAll(':', '')}`
</script>

<template>
	<button
		ref="$root"
		class="TqInputRotary"
		:class="{tweaking, subfocus: multi.subfocus}"
		:tweak-mode="tweakMode"
		type="button"
		:disabled="props.disabled"
		:aria-invalid="props.invalid || undefined"
		:inline-position="props.inlinePosition"
		:block-position="props.blockPosition"
		data-tq-component="input-rotary"
		:data-tq-tweaking="tweaking ? '' : undefined"
		:data-tq-subfocus="multi.subfocus ? '' : undefined"
		:data-tq-tweak-mode="tweakMode"
		data-tq-part="root"
		@focus="emit('focus')"
		@blur="emit('blur')"
	>
		<SvgIcon mode="block" class="rotary" data-tq-part="rotary">
			<circle class="circle" data-tq-part="circle" cx="16" cy="16" r="16" />
			<g
				:style="rotaryStyles"
				data-tq-part="indicator"
				@pointerenter="tweakModeByPointer = 'absolute'"
				@pointerleave="!tweaking && (tweakModeByPointer = 'relative')"
			>
				<path
					class="absolute-mode-area"
					data-tq-part="absolute-mode-area"
					d="M 16 16 L 16 32 A 16 16 0 0 0 16 0 Z"
				/>
				<path class="tip" data-tq-part="tip" d="M20 16 L30 16" />
			</g>
			<circle
				cx="16"
				cy="16"
				r="7"
				fill="transparent"
				stroke="none"
				data-tq-part="relative-mode-area"
			/>
		</SvgIcon>
	</button>
	<TweakOverlay v-if="tweaking">
		<div
			class="overlay"
			data-tq-component="input-rotary-overlay"
			data-tq-part="overlay"
		>
			<svg>
				<defs>
					<marker
						:id="markerId"
						markerWidth="6"
						markerHeight="6"
						refX="3"
						refY="3"
						orient="auto"
						fill="var(--tq-color-accent)"
					>
						<path d="M 0 0 L 6 3 L 0 6 Z" />
					</marker>
				</defs>
				<path
					class="thin gray"
					:class="{snap: doSnap}"
					:data-tq-snap="doSnap ? '' : undefined"
					data-tq-part="meter-path"
					:d="metersPath"
				/>
				<path
					class="bold"
					data-tq-part="drag-path"
					:d="overlayPath"
					:marker-end="tweakMode === 'relative' ? `url(#${markerId})` : ''"
				/>
				<path
					class="bold"
					data-tq-part="active-meter-path"
					:d="activeMeterPath"
				/>
			</svg>
			<Tooltip
				ref="overlayLabel"
				class="overlay-label"
				data-tq-part="overlay-label"
				:style="{
					top: overlayLabelPos[1] + 'px',
					left: overlayLabelPos[0] + 'px',
				}"
			>
				{{ display }}
				<span
					class="arrows"
					data-tq-part="arrows"
					:style="overlayArrowStyles"
				/>
			</Tooltip>
		</div>
	</TweakOverlay>
</template>
