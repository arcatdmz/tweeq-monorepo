import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import styles from './ParameterGrid.module.styl'

export function ParameterGrid({
	className,
	...props
}: HTMLAttributes<HTMLUListElement>) {
	return (
		<ul
			{...props}
			className={classNames('TqParameterGrid', styles.grid, className)}
		/>
	)
}
