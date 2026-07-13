<script setup lang="ts">
import {createCodeEditorMarkers} from '@tweeq/core'
import type {editor, IDisposable} from 'monaco-editor'
import {
	computed,
	markRaw,
	onBeforeUnmount,
	onMounted,
	shallowRef,
	watch,
	watchEffect,
} from 'vue'

import type {MonacoEditorProps} from './types'
import {useThemeStore} from '../stores/theme'

const props = defineProps<MonacoEditorProps>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
	'update:cursorIndex': [value: number]
	'update:cursorPosition': [value: readonly [number, number]]
}>()

const theme = useThemeStore()

const editorOptions = computed<editor.IStandaloneEditorConstructionOptions>(() => ({
	minimap: {enabled: false},
	fontLigatures: true,
	fontFamily: 'Geist Mono',
	fontSize: theme.rem,
	folding: false,
	lineNumbers: 'off',
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 0,
	overviewRulerLanes: 0,
	renderLineHighlight: 'none',
	scrollBeyondLastLine: false,
	scrollbar: {
		horizontalSliderSize: 2,
		useShadows: false,
		verticalSliderSize: 2,
		verticalScrollbarSize: 2,
	},
	tabSize: 2,
	bracketPairColorization: {enabled: false},
	guides: {indentation: false},
}))

// Register (and keep in sync) the palette-derived editor theme. defineTheme is
// global and safe to call before the editor mounts; setTheme re-applies it when
// the palette/appearance changes.
const THEME_NAME = 'tweeq'
const codeEditor = shallowRef()
const monacoApi = shallowRef<typeof import('monaco-editor')>()
const editorInstance = shallowRef<editor.IStandaloneCodeEditor>()
const editorDisposables: IDisposable[] = []
let active = true

watchEffect(() => {
	if (!monacoApi.value) return
	monacoApi.value.editor.defineTheme(
		THEME_NAME,
		theme.monacoTheme as editor.IStandaloneThemeData
	)
	monacoApi.value.editor.setTheme(THEME_NAME)
})

onMounted(async () => {
	const [wrapper, monaco] = await Promise.all([
		import('monaco-editor-vue3'),
		import('monaco-editor'),
	])
	if (!active) return
	codeEditor.value = markRaw(wrapper.CodeEditor)
	monacoApi.value = monaco
})

function onEditorDidMount(instance: editor.IStandaloneCodeEditor) {
	editorInstance.value = instance
	editorDisposables.push(
		instance.onKeyDown(event => event.browserEvent.stopPropagation()),
		instance.onKeyUp(event => event.browserEvent.stopPropagation()),
		instance.onDidChangeCursorPosition(() => {
			const position = instance.getPosition()
			if (!position) return
			emit(
				'update:cursorIndex',
				instance.getModel()?.getOffsetAt(position) ?? 0
			)
			const visible = instance.getScrolledVisiblePosition(position)
			if (visible) {
				emit('update:cursorPosition', [
					visible.left,
					visible.top + visible.height,
				])
			}
		})
	)
}

watch(
	[() => props.cursorIndex, editorInstance],
	([cursorIndex, instance]) => {
		if (cursorIndex === undefined || !instance) return
		const position = instance.getModel()?.getPositionAt(cursorIndex)
		if (position) instance.setPosition(position)
	},
	{immediate: true}
)

watchEffect(() => {
	const instance = editorInstance.value
	const api = monacoApi.value
	const model = instance?.getModel()
	if (!api || !model) return
	api.editor.setModelMarkers(
		model,
		'tweeq',
		createCodeEditorMarkers(props.errors, api.MarkerSeverity.Error)
	)
})

onBeforeUnmount(() => {
	active = false
	for (const disposable of editorDisposables) disposable.dispose()
})
</script>

<template>
	<component
		:is="codeEditor"
		v-if="codeEditor"
		ref="$editor"
		class="TqMonacoEditor"
		data-tq-component="monaco-editor"
		data-tq-part="root"
		:value="modelValue"
		:theme="THEME_NAME"
		:language="lang"
		:options="editorOptions"
		@update:value="$emit('update:modelValue', $event)"
		@editorDidMount="onEditorDidMount"
	height="100%"
	/>
</template>
