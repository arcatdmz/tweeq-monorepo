import {type IconSequence} from 'bndr-js'
import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import styles from './BindIcon.module.styl'

export interface BindIconProps extends HTMLAttributes<HTMLDivElement> {
	icon: IconSequence
}

export function BindIcon({icon, className, ...props}: BindIconProps) {
	return (
		<div {...props} className={classNames(styles.bindIcon, className)}>
			{icon.map((entry, index) =>
				typeof entry === 'string' ? (
					<span key={index}>{entry}</span>
				) : (
					<Icon key={index} className={styles.icon} icon={entry.icon} />
				)
			)}
		</div>
	)
}
