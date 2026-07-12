<script setup lang="ts">
import {
	initTweeq,
	InputCheckbox,
	InputColor,
	InputNumber,
	InputString,
	InputSwitch,
	InputTime,
	ParameterGrid,
} from '@tweeq/vue'
import {ref} from 'vue'

initTweeq('com.tweeq.playground-vue')

const size = ref(1)
const name = ref('tweeq')
const color = ref('#ff6633')
const enabled = ref(true)
const flag = ref(false)
const time = ref(0)
</script>

<template>
	<main style="max-width: 24rem; padding: 2rem">
		<h1>Tweeq Vue playground</h1>
		<ParameterGrid>
			<InputNumber v-model="size" :min="0" :max="10" />
			<InputString v-model="name" />
			<InputColor v-model="color" />
			<InputSwitch v-model="enabled" />
			<InputCheckbox v-model="flag" />
			<InputTime v-model="time" />
		</ParameterGrid>
	</main>
</template>
