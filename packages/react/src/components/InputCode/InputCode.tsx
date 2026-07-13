import {type HTMLAttributes} from 'react'

import {MonacoEditor, type MonacoEditorProps} from '../MonacoEditor'

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
		<div
			{...props}
			className={className}
			data-tq-component="input-code"
			data-tq-part="root"
		>
			<MonacoEditor
				data-tq-part="editor"
				value={value}
				onChange={onChange}
				lang={lang}
				errors={errors}
			/>
		</div>
	)
}
