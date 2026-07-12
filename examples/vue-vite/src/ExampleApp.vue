<script setup lang="ts">
import {initTweeq, InputNumber, InputString} from '@tweeq/vue'
import {ref} from 'vue'

initTweeq('com.tweeq.example-vue-vite')

const size = ref(1)
const name = ref('tweeq')
</script>

<template>
	<div style="max-width: 20rem; padding: 2rem">
		<InputNumber v-model="size" :min="0" :max="10" />
		<InputString v-model="name" />
	</div>
</template>
