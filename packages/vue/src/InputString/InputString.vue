<script lang="ts" setup>
import {computed, nextTick, ref, useTemplateRef, watch} from 'vue'
import {compileStringExpression} from '@tweeq/core'

import {InputTextBase} from '../InputTextBase'
import {useMultiSelectStore} from '../stores/multiSelect'
import {InputEmits} from '../types'
import {useValidator} from '../use/useValidator'
import * as V from '@tweeq/core/validator'
import {type InputStringProps} from './types'

const model = defineModel<string>({required: true})

const props = withDefaults(defineProps<InputStringProps>(), {
	validator: V.identity,
})

const emit = defineEmits<InputEmits>()

const local = ref(model.value)
const display = ref(model.value)
const {validLocal, validateResult} = useValidator(local, props.validator)

const $input = useTemplateRef('$input')
const focused = ref(false)

const expressionEnabled = ref(false)
const expressionError = ref<string | undefined>(undefined)

const invalid = computed(
	() =>
		props.invalid ||
		validateResult.value.log.length > 0 ||
		!!expressionError.value
)

watch(
	() => model.value,
	value => {
		if (value !== validLocal.value) {
			local.value = value
		}
	},
	{flush: 'sync'}
)

watch(
	() => [local.value, focused.value] as const,
	([local, focusing]) => {
		if (!focusing) {
			display.value = local
		}
	},
	{flush: 'sync'}
)

watch(
	validLocal,
	validLocal => {
		if (validLocal !== undefined && validLocal !== model.value) {
			model.value = validLocal
		}
	},
	{flush: 'sync'}
)

function onFocus() {
	multi.capture()
	emit('focus')
}

function onKeyDown(e: KeyboardEvent) {
	if (e.metaKey && e.key === '=') {
		e.preventDefault()
		enableExpression()
	}
}

let localAtFocus = ''

function enableExpression() {
	expressionEnabled.value = true
	display.value = `"${local.value}"`
	localAtFocus = local.value
}

function onInput(e: Event) {
	const newValue = (e.target as HTMLInputElement).value
	display.value = newValue

	if (expressionEnabled.value) {
		try {
			const fn = compileStringExpression(newValue)
			local.value = fn(localAtFocus, {i: multi.index})
			expressionError.value = undefined
			multi.update(fn)
		} catch (e) {
			expressionError.value = (e as Error).message
			multi.update(x => x)
		}
	} else {
		local.value = newValue
		multi.update(() => newValue)
	}
}

function confirm() {
	emit('confirm')
	multi.capture()
	multi.confirm()

	expressionEnabled.value = false
	expressionError.value = undefined

	nextTick(() => {
		display.value = local.value = model.value
	})
}

function onBlur() {
	confirm()
	emit('blur')
}

defineExpose({
	select: () => {
		$input.value?.select()
	},
	blur: () => {
		$input.value?.blur()
	},
})

//------------------------------------------------------------------------------
// Styles

const font = computed(() => {
	if (props.font) return props.font

	if (expressionEnabled.value) return 'monospace'

	return undefined
})

//------------------------------------------------------------------------------
// Multi Select

const multi = useMultiSelectStore().register({
	type: 'string',
	el: $input,
	focusing: focused,
	getValue: () => local.value,
	setValue(value) {
		local.value = value
	},
	confirm() {
		emit('confirm')
	},
})

function onReset() {
	if (props.default !== undefined) model.value = props.default
}
</script>

<template>
	<InputTextBase
		ref="$input"
		v-model:focused="focused"
		class="TqInputString"
		:active="multi.subfocus"
		:modelValue="display"
		:theme="theme"
		:font="font"
		:align="align"
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:disabled="disabled"
		:invalid="invalid"
		:default="props.default"
		@focus="onFocus"
		@blur="onBlur"
		@input="onInput"
		@keydown="onKeyDown"
		@keydown.enter="confirm"
		@reset="onReset"
	/>
</template>
