import {ensureMonacoEnvironment} from '@tweeq/dom'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

export function ensureMonacoWorker(): void {
	ensureMonacoEnvironment(() => new EditorWorker())
}
