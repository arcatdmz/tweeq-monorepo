import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'

export function ParameterGrid({
	className,
	...props
}: HTMLAttributes<HTMLUListElement>) {
	return (
		<ul
			{...props}
			className={classNames('TqParameterGrid', className)}
			data-tq-component="parameter-grid"
			data-tq-part="root"
		/>
	)
}
