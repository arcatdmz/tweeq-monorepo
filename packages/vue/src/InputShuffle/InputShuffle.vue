<script lang="ts" setup generic="T">
import {random} from 'lodash-es'
import {ref} from 'vue'

import {Icon} from '../Icon'
import {SvgIcon} from '../SvgIcon'
import type {InputShuffleProps} from './types'

const props = defineProps<InputShuffleProps<T>>()

const model = defineModel<T>({required: true})

const iconRot = ref(0)
// The die face is just flair now (values may be non-numeric), so roll it.
const iconNum = ref(3)

function shuffle() {
	iconRot.value += 90
	iconNum.value = random(1, 6)
	model.value = props.generate(model.value)
}
</script>

<template>
	<button
		class="TqInputShuffle"
		type="button"
		:disabled="disabled"
		:aria-invalid="invalid || undefined"
		data-tq-component="input-shuffle"
		data-tq-part="root"
		@click="shuffle"
	>
		<Icon
			v-if="icon"
			class="icon"
			:icon="icon"
			data-tq-part="icon"
			:style="{transform: `rotate(${iconRot}deg)`}"
		/>
		<SvgIcon
			v-else
			mode="block"
			class="icon"
			data-tq-part="icon"
			:style="{transform: `rotate(${iconRot}deg)`}"
		>
			<circle v-show="iconNum === 1" cx="16" cy="16" r="1" />
			<g v-show="iconNum === 2">
				<circle cx="11" cy="21" r="1" />
				<circle cx="21" cy="11" r="1" />
			</g>
			<g v-show="iconNum === 3">
				<circle cx="16" cy="16" r="1" />
				<circle cx="10" cy="22" r="1" />
				<circle cx="22" cy="10" r="1" />
			</g>
			<g v-show="iconNum === 4">
				<circle cx="10" cy="22" r="1" />
				<circle cx="22" cy="10" r="1" />
				<circle cx="10" cy="10" r="1" />
				<circle cx="22" cy="22" r="1" />
			</g>
			<g v-show="iconNum === 5">
				<circle cx="16" cy="16" r="1" />
				<circle cx="10" cy="22" r="1" />
				<circle cx="22" cy="10" r="1" />
				<circle cx="10" cy="10" r="1" />
				<circle cx="22" cy="22" r="1" />
			</g>
			<g v-show="iconNum === 6">
				<circle cx="10" cy="10" r="1" />
				<circle cx="10" cy="16" r="1" />
				<circle cx="10" cy="22" r="1" />
				<circle cx="22" cy="10" r="1" />
				<circle cx="22" cy="16" r="1" />
				<circle cx="22" cy="22" r="1" />
			</g>
			<path
				d="M24,29H8c-2.8,0-5-2.2-5-5V8c0-2.8,2.2-5,5-5h16c2.8,0,5,2.2,5,5v16C29,26.8,26.8,29,24,29z"
			/>
		</SvgIcon>
	</button>
</template>
