import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import styles from './Tooltip.module.styl'

export type TooltipProps = HTMLAttributes<HTMLDivElement>

export function Tooltip({className, ...props}: TooltipProps) {
	return <div {...props} className={classNames(styles.tqTooltip, className)} />
}
