import Editor, {loader, type OnMount} from '@monaco-editor/react'
import {type CodeEditorErrorInfo, createCodeEditorMarkers} from '@tweeq/core'
import {themeStore} from '@tweeq/dom'
import {type vec2} from 'linearly'
import type * as Monaco from 'monaco-editor'
import {type HTMLAttributes, useEffect, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {classNames} from '../../classNames'
import styles from './MonacoEditor.module.styl'

type MonacoApi = typeof Monaco
let monacoPromise: Promise<MonacoApi> | undefined

function loadMonaco(): Promise<MonacoApi> {
	monacoPromise ??= import('monaco-editor').then(monaco => {
		loader.config({monaco})
		return monaco
	})
	return monacoPromise
}

export type MonacoEditorErrorInfo = CodeEditorErrorInfo

export interface MonacoEditorProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value: string
	onChange?: (value: string) => void
	lang: string
	cursorIndex?: number
	onChangeCursorIndex?: (value: number) => void
	onChangeCursorPosition?: (value: vec2) => void
	errors?: MonacoEditorErrorInfo[] | null
}

const THEME_NAME = 'tweeq'

export function MonacoEditor({
	value,
	onChange,
	lang,
	cursorIndex,
	onChangeCursorIndex,
	onChangeCursorPosition,
	errors,
	className,
	...props
}: MonacoEditorProps) {
	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
	const [monaco, setMonaco] = useState<MonacoApi | null>(null)
	const monacoTheme = useStore(themeStore, state => state.monacoTheme)
	const rem = useStore(themeStore, state => state.rem)

	useEffect(() => {
		let active = true
		void loadMonaco().then(api => {
			if (active) setMonaco(api)
		})
		return () => {
			active = false
		}
	}, [])
	useEffect(() => {
		if (!monaco) return
		monaco.editor.defineTheme(
			THEME_NAME,
			monacoTheme as Monaco.editor.IStandaloneThemeData
		)
		monaco.editor.setTheme(THEME_NAME)
	}, [monaco, monacoTheme])
	useEffect(() => {
		const editor = editorRef.current
		if (cursorIndex === undefined || !editor) return
		const position = editor.getModel()?.getPositionAt(cursorIndex)
		if (position) editor.setPosition(position)
	}, [cursorIndex])
	useEffect(() => {
		const model = editorRef.current?.getModel()
		if (!model || !monaco) return
		monaco.editor.setModelMarkers(
			model,
			'tweeq',
			createCodeEditorMarkers(errors, monaco.MarkerSeverity.Error)
		)
	}, [errors, monaco])

	const onMount: OnMount = editor => {
		editorRef.current = editor
		editor.onDidChangeCursorPosition(() => {
			const position = editor.getPosition()
			if (!position) return
			onChangeCursorIndex?.(editor.getModel()?.getOffsetAt(position) ?? 0)
			const visible = editor.getScrolledVisiblePosition(position)
			if (visible) {
				onChangeCursorPosition?.([visible.left, visible.top + visible.height])
			}
		})
	}

	return (
		<div
			{...props}
			className={classNames(styles.tqMonacoEditor, className)}
			onKeyDown={event => event.stopPropagation()}
			onKeyUp={event => event.stopPropagation()}
		>
			{monaco && <Editor
				value={value}
				theme={THEME_NAME}
				language={lang}
				height="100%"
				onMount={onMount}
				onChange={next => onChange?.(next ?? '')}
				options={{
					minimap: {enabled: false},
					fontLigatures: true,
					fontFamily: 'Geist Mono',
					fontSize: rem,
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
				}}
			/>}
		</div>
	)
}
