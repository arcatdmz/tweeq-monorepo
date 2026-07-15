import type {CodeEditorErrorInfo} from '@tweeq/core'

export type MonacoEditorErrorInfo = CodeEditorErrorInfo

export interface MonacoEditorProps {
	modelValue: string
	lang: string
	cursorIndex?: number
	errors?: MonacoEditorErrorInfo[] | null
}
