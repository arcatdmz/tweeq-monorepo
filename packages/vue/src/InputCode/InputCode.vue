<script setup lang="ts">
import {MonacoEditor} from '../MonacoEditor'
import type {InputCodeProps} from './types'

defineProps<InputCodeProps>()

defineEmits<{
	'update:modelValue': [string]
}>()
</script>

<template>
	<div class="TqInputCode" data-tq-component="input-code" data-tq-part="root">
		<MonacoEditor
			class="monaco-editor"
			data-tq-part="editor"
			:modelValue="modelValue"
			:lang="lang"
			:errors="errors"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
	</div>
</template>
