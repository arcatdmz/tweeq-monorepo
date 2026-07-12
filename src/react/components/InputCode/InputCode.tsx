import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import {MonacoEditor, type MonacoEditorProps} from '../MonacoEditor'
import styles from './InputCode.module.styl'

export interface InputCodeProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
		Pick<MonacoEditorProps, 'errors'> {
	value: string
	onChange?: (value: string) => void
	lang: string
}

export function InputCode({
	value,
	onChange,
	lang,
	errors,
	className,
	...props
}: InputCodeProps) {
	return (
		<div {...props} className={classNames(styles.tqInputCode, className)}>
			<MonacoEditor
				className={styles.monacoEditor}
				value={value}
				onChange={onChange}
				lang={lang}
				errors={errors}
			/>
		</div>
	)
}
