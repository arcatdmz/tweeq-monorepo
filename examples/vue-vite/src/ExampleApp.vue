<script setup lang="ts">
import {
	InputNumber,
	InputString,
	TweeqProvider,
	Viewport,
} from '@tweeq/vue'
import {ref} from 'vue'

const size = ref(1)
const name = ref('tweeq')
</script>

<template>
	<TweeqProvider app-id="com.tweeq.example-vue-vite">
		<Viewport>
			<div style="max-width: 20rem; padding: 2rem">
				<InputNumber v-model="size" :min="0" :max="10" />
				<InputString v-model="name" />
			</div>
		</Viewport>
	</TweeqProvider>
</template>
