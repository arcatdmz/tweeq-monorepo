import Editor, {loader, type OnMount} from '@monaco-editor/react'
import {type vec2} from 'linearly'
import * as monaco from 'monaco-editor'
import {type HTMLAttributes, useEffect, useRef} from 'react'
import {useStore} from 'zustand'

import {themeStore} from '../../../core'
import {classNames} from '../../classNames'
import styles from './MonacoEditor.module.styl'

loader.config({monaco})

export interface MonacoEditorErrorInfo {
	message: string
	line: number
	column: number
}

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
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
	const monacoTheme = useStore(themeStore, state => state.monacoTheme)
	const rem = useStore(themeStore, state => state.rem)

	useEffect(() => {
		monaco.editor.defineTheme(
			THEME_NAME,
			monacoTheme as monaco.editor.IStandaloneThemeData
		)
		monaco.editor.setTheme(THEME_NAME)
	}, [monacoTheme])
	useEffect(() => {
		const editor = editorRef.current
		if (cursorIndex === undefined || !editor) return
		const position = editor.getModel()?.getPositionAt(cursorIndex)
		if (position) editor.setPosition(position)
	}, [cursorIndex])
	useEffect(() => {
		const model = editorRef.current?.getModel()
		if (!model || !errors) return
		monaco.editor.setModelMarkers(
			model,
			'tweeq',
			errors.map(error => ({
				message: error.message,
				severity: monaco.MarkerSeverity.Error,
				startLineNumber: error.line,
				endLineNumber: error.line,
				startColumn: error.column,
				endColumn: error.column,
			}))
		)
	}, [errors])

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
			<Editor
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
			/>
		</div>
	)
}
